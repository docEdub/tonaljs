import {
  coordinates,
  isNamedPitch,
  isPitch,
  NamedPitch,
  Pitch,
  pitch,
  PitchCoordinates,
} from "@tonaljs/pitch";

const fillStr = (s: string, n: number) => Array(Math.abs(n) + 1).join(s);

export type NoteWithOctave = string;
export type PcName = string;
export type NoteName = NoteWithOctave | PcName;
export type NoteLiteral = NoteName | Pitch | NamedPitch;

export interface Note extends Pitch, NamedPitch {
  readonly empty: boolean;
  readonly name: NoteName;
  readonly letter: string;
  readonly acc: string;
  readonly pc: PcName;
  readonly chroma: number;
  readonly height: number;
  readonly coord: PitchCoordinates;
  readonly midi: number | null;
  readonly freq: number | null;
}

export type NoteType = Note;

const NoNote: Note = Object.freeze({
  empty: true,
  name: "",
  letter: "",
  acc: "",
  pc: "",
  step: NaN,
  alt: NaN,
  chroma: NaN,
  height: NaN,
  coord: [] as unknown as PitchCoordinates,
  midi: null,
  freq: null,
});

const cache: Map<NoteLiteral | undefined, Note> = new Map();

export const stepToLetter = (step: number) => "CDEFGAB".charAt(step);
export const altToAcc = (alt: number): string =>
  alt < 0 ? fillStr("b", -alt) : fillStr("#", alt);
export const accToAlt = (acc: string): number =>
  acc[0] === "b" ? -acc.length : acc.length;

/**
 * Given a note literal (a note name or a note object), returns the Note object
 * @example
 * note('Bb4') // => { name: "Bb4", midi: 70, chroma: 10, ... }
 */
export function note(src: NoteLiteral): Note {
  const stringSrc = JSON.stringify(src);

  const cached = cache.get(stringSrc);
  if (cached) {
    return cached;
  }

  const value =
    typeof src === "string"
      ? parse(src)
      : isPitch(src)
        ? note(pitchName(src))
        : isNamedPitch(src)
          ? note(src.name)
          : NoNote;
  cache.set(stringSrc, value);
  return value;
}

type NoteTokens = [string, string, string, string];

const REGEX = /^([a-gA-G]?)(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)$/;

/**
 * @private
 */
export function tokenizeNote(str: string): NoteTokens {
  const m = REGEX.exec(str) as string[];
  return m
    ? [m[1].toUpperCase(), m[2].replace(/x/g, "##"), m[3], m[4]]
    : ["", "", "", ""];
}

/**
 * @private
 */
export function coordToNote(noteCoord: PitchCoordinates): Note {
  return note(pitch(noteCoord)) as Note;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

const SEMI = [0, 2, 4, 5, 7, 9, 11];
function parse(noteName: NoteName): Note {
  const tokens = tokenizeNote(noteName);
  if (tokens[0] === "" || tokens[3] !== "") {
    return NoNote;
  }

  const letter = tokens[0];
  const acc = tokens[1];
  const octStr = tokens[2];

  const step = (letter.charCodeAt(0) + 3) % 7;
  const alt = accToAlt(acc);
  const oct = octStr.length ? +octStr : undefined;
  const coord = coordinates({ step, alt, oct });

  const name = letter + acc + octStr;
  const pc = letter + acc;
  const chroma = (SEMI[step] + alt + 120) % 12;
  const height =
    oct === undefined
      ? mod(SEMI[step] + alt, 12) - 12 * 99
      : SEMI[step] + alt + 12 * (oct + 1);
  const midi = height >= 0 && height <= 127 ? height : null;
  const freq = oct === undefined ? null : Math.pow(2, (height - 69) / 12) * 440;

  return {
    empty: false,
    acc,
    alt,
    chroma,
    coord,
    freq,
    height,
    letter,
    midi,
    name,
    oct,
    pc,
    step,
  };
}

function pitchName(props: Pitch): NoteName {
  const { step, alt, oct } = props;
  const letter = stepToLetter(step);
  if (!letter) {
    return "";
  }

  const pc = letter + altToAcc(alt);
  return oct || oct === 0 ? pc + oct : pc;
}
