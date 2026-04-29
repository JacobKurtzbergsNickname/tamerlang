"use client";
import { useState, useCallback } from "react";
import { Word } from "../../types/PartsOfSpeech";
import { VocabularyContext } from "./VocabularyContext";
import { useSrsWords } from "../../hooks/useSrsWords";
import { authFetch } from "../../lib/api";

type ProviderProperties = {
  children: React.ReactNode;
};

export const VocabularyProvider: React.FC<ProviderProperties> = ({
  children,
}) => {
  const { words, loading, error, dueCount, nextReviewAt, token } =
    useSrsWords();
  const [correctWord, setCorrectWord] = useState<Word>({ id: "", word: "", translation: "" });
  const [current, setCurrent] = useState<number>(0);
  const [isAnswerSelected, setIsAnswerSelected] = useState<boolean>(false);

  const submitReview = useCallback(
    (wordId: string, quality: number) => {
      if (!token) return;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      void authFetch(
        `${apiUrl}/srs/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wordId, wordType: "word", quality }),
        },
        token,
      );
    },
    [token],
  );

  return (
    <VocabularyContext.Provider
      value={{
        words,
        correctWord,
        current,
        setCurrent,
        setCorrectWord,
        isAnswerSelected,
        setIsAnswerSelected,
        loading,
        error,
        dueCount,
        nextReviewAt,
        submitReview,
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
};
