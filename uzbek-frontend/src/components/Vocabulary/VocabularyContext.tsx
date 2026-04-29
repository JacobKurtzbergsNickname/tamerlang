"use client";
import { emptyWord, Word, Words } from "../../types/PartsOfSpeech";
import { createContext, Dispatch, SetStateAction } from "react";

export interface VocabContextProperties {
  words: Words;
  correctWord: Word;
  current: number;
  setCurrent: Dispatch<SetStateAction<number>>;
  setCorrectWord: Dispatch<SetStateAction<Word>>;
  isAnswerSelected: boolean;
  setIsAnswerSelected: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  error: string | null;
  dueCount: number;
  nextReviewAt: Date | null;
  submitReview: (wordId: string, quality: number) => void;
}

const initialVocabContext: VocabContextProperties = {
  words: [],
  correctWord: emptyWord(),
  setCorrectWord: () => {},
  current: 0,
  setCurrent: () => {},
  isAnswerSelected: false,
  setIsAnswerSelected: () => {},
  loading: true,
  error: null,
  dueCount: 0,
  nextReviewAt: null,
  submitReview: () => {},
};

export const VocabularyContext = createContext(initialVocabContext);
