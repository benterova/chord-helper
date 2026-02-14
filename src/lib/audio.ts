
export class AudioEngineImpl {
    private ctx: AudioContext;
    private masterGain: GainNode;
    private metronomeGain: GainNode;
    public analyser: AnalyserNode;

    private schedulerInterval: number | null = null;
    private nextNoteTime: number = 0;
    private playbackQueue: { notes: number[], duration: number }[] = [];
    private originalSequence: { notes: number[], duration: number }[] = []; // for looping
    private isPlaying: boolean = false;
    private isLooping: boolean = false;
    private activeNodes: AudioNode[] = [];

    // State tracking
    private playingId: string | null = null;
    private listeners: ((playingId: string | null) => void)[] = [];
    private loopListeners: ((isLooping: boolean) => void)[] = [];

    // Chill Mode State
    private chillOption: boolean = false;
    private filterNode: BiquadFilterNode;
    private lfo: OscillatorNode;
    private lfoGain: GainNode;
    private chillGain: GainNode;

    // Chill Arp State
    private arpGain: GainNode;
    private delayNode: DelayNode;
    private delayFeedback: GainNode;

    // Metronome state
    private bpm: number = 120;
    private nextBeatTime: number = 0;

    constructor() {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        this.ctx = new AudioContextClass();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;

        // Initialize Chill Mode Nodes
        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = 800; // Base cutoff
        this.filterNode.Q.value = 5; // Resonance

        this.lfo = this.ctx.createOscillator();
        this.lfo.type = 'sine';
        this.lfo.frequency.value = 0.2; // Slow sweep

        this.lfoGain = this.ctx.createGain();
        this.lfoGain.gain.value = 400; // Modulation depth

        this.chillGain = this.ctx.createGain();
        this.chillGain.gain.value = 0.8;

        // Arp & Delay
        this.arpGain = this.ctx.createGain();
        this.arpGain.gain.value = 0.15; // Quiet

        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.value = 0.3;

        this.delayFeedback = this.ctx.createGain();
        this.delayFeedback.gain.value = 0.4;

        // Audio Graph for LFO -> Filter
        this.lfo.connect(this.lfoGain);
        this.lfoGain.connect(this.filterNode.frequency);
        this.lfo.start();

        // Audio Graph for Arp -> Delay -> Master
        this.arpGain.connect(this.delayNode);
        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode);
        this.delayNode.connect(this.masterGain);
        this.arpGain.connect(this.masterGain); // Dry signal too

        // Filter connection involves conditional routing in scheduleNotes, 
        // but we setup the filter -> master path here
        this.filterNode.connect(this.chillGain);
        this.chillGain.connect(this.masterGain);

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256; // Good balance for visualizer

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        this.metronomeGain = this.ctx.createGain();
        this.metronomeGain.gain.value = 0.3; // Default on
        this.metronomeGain.connect(this.ctx.destination);
    }

    public setChillMode(enabled: boolean) {
        this.chillOption = enabled;
        // Adjust master gain to compensate for filter energy loss if needed
        // For now, steady.
    }

    public getChillMode() {
        return this.chillOption;
    }

    public setBpm(bpm: number) {
        this.bpm = bpm;
    }

    public subscribe(callback: (playingId: string | null) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    public subscribeLoop(callback: (isLooping: boolean) => void) {
        this.loopListeners.push(callback);
        // Immediately verify current state
        callback(this.isLooping);
        return () => {
            this.loopListeners = this.loopListeners.filter(l => l !== callback);
        };
    }

    private notify() {
        this.listeners.forEach(l => l(this.playingId));
    }

    private notifyLoop() {
        this.loopListeners.forEach(l => l(this.isLooping));
    }

    public getPlayingId() {
        return this.playingId;
    }

    public getLoop() {
        return this.isLooping;
    }

    private midiToFreq(midi: number): number {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    public setMetronome(enabled: boolean) {
        const now = this.ctx.currentTime;
        this.metronomeGain.gain.cancelScheduledValues(now);
        this.metronomeGain.gain.setTargetAtTime(enabled ? 0.3 : 0, now, 0.01);
    }

    public setLoop(enabled: boolean) {
        if (this.isLooping !== enabled) {
            this.isLooping = enabled;
            this.notifyLoop();
        }
    }

    public stop() {
        this.isPlaying = false;
        this.playingId = null;
        this.notify();

        if (this.schedulerInterval) {
            window.clearTimeout(this.schedulerInterval);
            this.schedulerInterval = null;
        }

        this.activeNodes.forEach(node => {
            try { (node as any).stop(); } catch (e) { }
            node.disconnect();
        });
        this.activeNodes = [];
        this.playbackQueue = [];
        this.originalSequence = [];
    }

    public playNotes(notes: number[], duration: number = 0.5, concurrent: boolean = false) {
        if (!concurrent) {
            this.stop();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.scheduleNotes(notes, duration, this.ctx.currentTime);
    }

    public playProgression(sequence: { notes: number[], duration: number }[], id?: string, bpm: number = 120) {
        this.stop(); // Stops previous and notifies null
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.isPlaying = true;
        this.playingId = id || 'unknown';
        this.bpm = bpm;
        this.notify();

        this.playbackQueue = [...sequence];
        this.originalSequence = [...sequence];
        this.nextNoteTime = this.ctx.currentTime;
        this.nextBeatTime = this.ctx.currentTime;
        this.scheduler();
    }

    private scheduler() {
        if (!this.isPlaying) return;

        const lookahead = 25.0; // ms
        const scheduleAheadTime = 0.1; // seconds

        // 1. Schedule Notes
        while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime && this.playbackQueue.length > 0) {
            const currentItem = this.playbackQueue.shift();
            if (!currentItem) break;

            const duration = currentItem.duration;
            const time = this.nextNoteTime;

            // Schedule Chord
            if (currentItem.notes.length > 0) {
                this.scheduleNotes(currentItem.notes, duration, time, true);
            }

            this.nextNoteTime += duration;
        }

        // 2. Schedule Metronome (Decoupled)
        // Only schedule if we are still playing or have notes queued
        // or if we are looping.
        while (this.nextBeatTime < this.ctx.currentTime + scheduleAheadTime) {
            // Schedule beat
            // Beat 1 is usually accented. Tracking measure position requires more state.
            // For now, simple steady click.
            // Improve: Reset beat count on Play? 

            this.scheduleMetronomeClick(this.nextBeatTime, false); // No accent logic for now to keep simple

            const secondsPerBeat = 60.0 / this.bpm;
            this.nextBeatTime += secondsPerBeat;
        }

        // Handle Looping
        if (this.playbackQueue.length === 0 && this.isPlaying && this.isLooping) {
            this.playbackQueue = [...this.originalSequence];
        }

        // Keep running if:
        // 1. Queue has items
        // 2. OR Loop is enabled (even if queue empty, we just refilled it? wait, refilling prevents empty)
        // 3. OR current notes are still playing? 
        // Actually, if queue is empty and NOT looping, we should stop eventually.
        // But we want metronome to run until the end of the last note.

        const isQueueActive = this.playbackQueue.length > 0 || this.nextNoteTime >= this.ctx.currentTime;

        if (isQueueActive) {
            this.schedulerInterval = window.setTimeout(() => this.scheduler(), lookahead);
        } else {
            // Stop after last note finishes?
            // Let's optimize: stop when time > nextNoteTime (end of song)
            this.isPlaying = false;
            this.playingId = null;
            this.notify();
            this.schedulerInterval = null;
        }
    }

    private scheduleNotes(notes: number[], duration: number, time: number, track: boolean = false) {
        // If Chill Mode is on, maybe trigger an arp occasionally
        if (this.chillOption && track) {
            // "Occasional" - e.g. 40% chance per chord, or based on time
            if (Math.random() < 0.6) {
                this.scheduleArp(notes, time, duration);
            }
        }

        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = this.chillOption ? 'sine' : 'triangle'; // Smoother sound for chill
            osc.frequency.setValueAtTime(this.midiToFreq(note), time);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime((0.3 / notes.length) * (this.chillOption ? 0.8 : 1), time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            osc.connect(gain);

            if (this.chillOption) {
                gain.connect(this.filterNode);
            } else {
                gain.connect(this.masterGain);
            }

            osc.start(time);
            osc.stop(time + duration + 0.1);

            if (track) {
                this.activeNodes.push(osc);
                this.activeNodes.push(gain);
            }

            osc.onended = () => {
                if (track) {
                    this.activeNodes = this.activeNodes.filter(n => n !== osc && n !== gain);
                }
                osc.disconnect();
                gain.disconnect();
            };
        });
    }

    private scheduleArp(notes: number[], startTime: number, totalDuration: number) {
        // Pick 3-4 random notes from the chord to arp
        const arpCount = 3 + Math.floor(Math.random() * 2);
        const noteDuration = 0.15; // Short play
        const interval = 0.12; // Time between notes

        for (let i = 0; i < arpCount; i++) {
            const noteIndex = Math.floor(Math.random() * notes.length);
            const midi = notes[noteIndex] + 12; // Octave up
            const time = startTime + (i * interval) + (Math.random() * 0.05); // Slight humanize

            if (time > startTime + totalDuration) break;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(this.midiToFreq(midi), time);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.4, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + noteDuration);

            osc.connect(gain);
            gain.connect(this.arpGain); // Goes to delay -> master

            osc.start(time);
            osc.stop(time + noteDuration + 0.1);

            this.activeNodes.push(osc);
            this.activeNodes.push(gain);

            osc.onended = () => {
                this.activeNodes = this.activeNodes.filter(n => n !== osc && n !== gain);
                osc.disconnect();
                gain.disconnect();
            };
        }
    }

    private scheduleMetronomeClick(time: number, isAccent: boolean) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.value = isAccent ? 1200 : 800;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(1.0, time + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.connect(gain);
        gain.connect(this.metronomeGain); // Important: Connect to dynamic gain node

        osc.start(time);
        osc.stop(time + 0.1);

        this.activeNodes.push(osc);
        this.activeNodes.push(gain); // Track for stop()

        osc.onended = () => {
            this.activeNodes = this.activeNodes.filter(n => n !== osc && n !== gain);
            osc.disconnect();
            gain.disconnect();
        };
    }

    public getCurrentTime(): number {
        return this.ctx.currentTime;
    }
}

export const audioEngine = new AudioEngineImpl();
