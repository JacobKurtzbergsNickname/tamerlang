"use client";
import React, { useEffect } from "react";
import { AnswerOption } from "./AnswerOption";
import { Translation } from "./Translation";
import { useTimedQuizMachine } from "./useTimedQuizMachine";
import { Result, Word } from "../../types/PartsOfSpeech";

interface TimedVocabularyTestProps {
  words: Word[];
  loading: boolean;
  error: string | null;
  nextReviewAt: Date | null;
  onComplete: (results: Array<Result>) => void;
  submitReview: (wordId: string, quality: number) => void;
}

function TimedVocabularyTest({
  words,
  loading,
  error,
  nextReviewAt,
  onComplete,
  submitReview,
}: TimedVocabularyTestProps) {
  const { state, selectAnswer } = useTimedQuizMachine(words, submitReview);
  const word = words[state.current];

  useEffect(() => {
    if (state.phase === "finished") {
      onComplete(state.results);
    }
  }, [state.phase, state.results, onComplete]);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        Loading your review session…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (words.length === 0) {
    const nextLabel = nextReviewAt
      ? nextReviewAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;
    return (
      <div className="text-center py-12">
        <p className="text-2xl mb-2">All caught up!</p>
        {nextLabel ? (
          <p className="text-gray-400">Next review available at {nextLabel}.</p>
        ) : (
          <p className="text-gray-400">No words enrolled yet.</p>
        )}
      </div>
    );
  }

  if (state.phase === "finished") {
    return <div>Test finished!</div>;
  }

  return (
    <section>
      <div>Time left: {state.timer}s</div>
      <Translation>{word.translation}</Translation>
      <section className="grid grid-cols-2 gap-1 justify-center items-center w-fit mx-auto mt-8">
        {state.answerOptions.map((w, index) => (
          <AnswerOption
            answer={w}
            key={index}
            index={index}
            check={() => selectAnswer(w.word)}
            isAnswerSelected={state.phase === "showingAnswer"}
            correctWord={word.word}
            selectedWord={state.selected}
          />
        ))}
      </section>
      <div>
        {state.current + 1} / {words.length}
      </div>
    </section>
  );
}

export default TimedVocabularyTest;
