
export class AudioEngineImpl {
    private ctx: AudioContext;
    private masterGain: GainNode;
    private metronomeGain: GainNode;

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

    constructor() {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        this.ctx = new AudioContextClass();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);

        this.metronomeGain = this.ctx.createGain();
        this.metronomeGain.gain.value = 0; // Default off
        this.metronomeGain.connect(this.ctx.destination);
    }

    public subscribe(callback: (playingId: string | null) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notify() {
        this.listeners.forEach(l => l(this.playingId));
    }

    public getPlayingId() {
        return this.playingId;
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
        this.isLooping = enabled;
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

    public playProgression(sequence: { notes: number[], duration: number }[], id?: string) {
        this.stop(); // Stops previous and notifies null
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.isPlaying = true;
        this.playingId = id || 'unknown';
        this.notify();

        this.playbackQueue = [...sequence];
        this.originalSequence = [...sequence];
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduler();
    }

    private scheduler() {
        if (!this.isPlaying) return;

        const lookahead = 25.0; // ms
        const scheduleAheadTime = 0.1; // seconds

        while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime && this.playbackQueue.length > 0) {
            const currentItem = this.playbackQueue.shift();
            if (!currentItem) break;

            const duration = currentItem.duration;
            const time = this.nextNoteTime;

            // Schedule Chord
            this.scheduleNotes(currentItem.notes, duration, time, true); // track nodes

            // Schedule Metronome (assuming 4/4, 4 beats per chord duration)
            const beats = 4;
            const beatDur = duration / beats;
            for (let i = 0; i < beats; i++) {
                this.scheduleMetronomeClick(time + (i * beatDur), i === 0);
            }

            this.nextNoteTime += duration;
        }

        // Handle Looping
        if (this.playbackQueue.length === 0 && this.isPlaying && this.isLooping) {
            this.playbackQueue = [...this.originalSequence];
        }

        if (this.playbackQueue.length > 0 || this.nextNoteTime >= this.ctx.currentTime) {
            this.schedulerInterval = window.setTimeout(() => this.scheduler(), lookahead);
        } else {
            this.isPlaying = false;
            this.playingId = null;
            this.notify();
            this.schedulerInterval = null;
        }
    }

    private scheduleNotes(notes: number[], duration: number, time: number, track: boolean = false) {
        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(this.midiToFreq(note), time);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.3 / notes.length, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);

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
