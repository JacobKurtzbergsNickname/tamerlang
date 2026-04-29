"use client";
import { JSX, useContext } from "react";
import { VocabularyContext } from "./VocabularyContext";
import { VocabularyProvider } from "./VocabularyProvider";
import TimedVocabularyTest from "./TimedVocabularyTest";

function VocabularyInner(): JSX.Element {
  const { words, loading, error, nextReviewAt, submitReview } =
    useContext(VocabularyContext);
  return (
    <TimedVocabularyTest
      words={words}
      loading={loading}
      error={error}
      nextReviewAt={nextReviewAt}
      onComplete={() => {}}
      submitReview={submitReview}
    />
  );
}

function Vocabulary(): JSX.Element {
  return (
    <section>
      <VocabularyProvider>
        <VocabularyInner />
      </VocabularyProvider>
    </section>
  );
}

export default Vocabulary;
