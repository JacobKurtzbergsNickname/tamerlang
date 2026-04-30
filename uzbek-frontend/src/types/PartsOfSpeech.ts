type DbEntry = {
  createdAt: Date;
  updatedAt: Date;
};

type Result = {
  word: Word;
  selected: string | null;
  correct: boolean;
};

type WordDBO = Word & DbEntry;

type Word = {
  id: string;
  word: string;
  translation: string;
};

enum PartOfSpeech {
  Noun = "Noun",
  Verb = "Verb",
  Adjective = "Adjective",
  Adverb = "Adverb",
  Pronoun = "Pronoun",
  Preposition = "Preposition",
  Postposition = "Postposition",
  Conjunction = "Conjunction",
  Interjection = "Interjection",
}

interface Phrase {
  id: string;
  words: Array<WordForm>;
  meaning: string;
}

type PhraseDBO = Phrase & DbEntry;

interface Suffix {
  id: string;
  suffix: string;
  meaning: string;
  attachesTo: PartOfSpeech;
}

type SuffixDBO = Suffix & DbEntry;

interface WordForm {
  word: Word;
  suffixes: Array<Suffix>;
}

type WordFormDBO = WordForm & DbEntry;

type Words = Array<Word>;
type Phrases = Array<Phrase>;
type Suffixes = Array<Suffix>;
type Results = Array<Result>;
type WordForms = Array<WordForm>;

const emptyWord = (): Word => {
  return {
    id: "",
    word: "",
    translation: "",
  };
};

const emptyPhrase = (): Phrase => {
  return {
    id: "",
    words: [],
    meaning: "",
  };
};

const emptySuffix = (): Suffix => {
  return {
    id: "",
    suffix: "",
    meaning: "",
    attachesTo: PartOfSpeech.Noun,
  };
};

const emptyWordForm = (): WordForm => {
  return {
    word: emptyWord(),
    suffixes: [],
  };
};

export type {
  Phrase,
  Phrases,
  PhraseDBO,
  Suffix,
  Suffixes,
  SuffixDBO,
  Result,
  Results,
  Word,
  Words,
  WordDBO,
  WordForm,
  WordForms,
  WordFormDBO,
};

export { emptyWord, emptyPhrase, emptySuffix, emptyWordForm, PartOfSpeech };
