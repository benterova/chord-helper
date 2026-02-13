export type StyleName =
    | 'pop'
    | 'jazz'
    | 'blues'
    | 'rnb'
    | 'rock'
    | 'lofi'
    | 'epic'
    | 'bossa'
    | 'folk'
    | 'hyperpop'
    | 'jpop'
    | 'future'
    | 'dark';

export interface RhythmPattern {
    name: string;
    length: number;
    pattern: number[];
}

export type TransitionMatrix = Record<number, Record<number, number>>;

export interface StyleDef {
    name: StyleName;
    transitions: TransitionMatrix;
    rhythms: RhythmPattern[];
    optimizeVoicing(notes: number[]): number[];
}

export interface MidiEvent {
    notes: number[];
    velocity: number;
    duration: number;
    startTime: number;
}
