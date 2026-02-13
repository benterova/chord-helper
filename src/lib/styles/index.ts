import type { StyleDef, StyleName } from './interfaces';
import { pop } from './pop';
import { jazz } from './jazz';
import { blues } from './blues';
import { rnb } from './rnb';
import { rock } from './rock';
import { lofi } from './lofi';
import { epic } from './epic';
import { bossa } from './bossa';
import { folk } from './folk';
import { hyperpop } from './hyperpop';
import { jpop } from './jpop';
import { future } from './future';
import { dark } from './dark';

export const ALL_STYLES: Record<StyleName, StyleDef> = {
    pop,
    jazz,
    blues,
    rnb,
    rock,
    lofi,
    epic,
    bossa,
    folk,
    hyperpop,
    jpop,
    future,
    dark
};

export const STYLES = {
    POP: 'pop',
    JAZZ: 'jazz',
    BLUES: 'blues',
    RNB: 'rnb',
    ROCK: 'rock',
    LOFI: 'lofi',
    EPIC: 'epic',
    BOSSA: 'bossa',
    FOLK: 'folk',
    HYPERPOP: 'hyperpop',
    JPOP: 'jpop',
    FUTURE: 'future',
    DARK: 'dark'
} as const;

export type Style = StyleName;
export type { RhythmPattern, TransitionMatrix, StyleDef, MidiEvent } from './interfaces';
