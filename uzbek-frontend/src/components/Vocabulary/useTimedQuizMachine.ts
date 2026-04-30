import { useReducer, useEffect, useRef } from "react";
import { Word } from "../../types/PartsOfSpeech";
import { AnswerOptionDTO } from "../../types/AnswerOption";
import { WordUtils } from "../../utils/word-utilities";

// --- Types ---
type Phase = "question" | "showingAnswer" | "finished";

interface QuizState {
  current: number;
  phase: Phase;
  timer: number;
  selected: string | null;
  answerOptions: AnswerOptionDTO[];
  results: Array<{ word: Word; selected: string | null; correct: boolean }>;
}

type QuizAction =
  | { type: "START_QUESTION" }
  | { type: "TICK" }
  | { type: "SELECT_ANSWER"; answer: string }
  | { type: "TIMEOUT" }
  | { type: "SHOW_ANSWER" }
  | { type: "NEXT_QUESTION" }
  | { type: "FINISH" };

// --- Helpers ---
function generateOptions(words: Word[], current: number): AnswerOptionDTO[] {
  return WordUtils.generateTestOptions(words, current);
}

function markAnswers(
  options: AnswerOptionDTO[],
  correctWord: string,
  selected: string | null,
): AnswerOptionDTO[] {
  return options.map((opt) => {
    if (selected === null) {
      return {
        ...opt,
        isSelected: false,
        isCorrect: opt.word === correctWord,
      };
    }
    if (opt.word === selected) {
      return {
        ...opt,
        isSelected: true,
        isCorrect: opt.word === correctWord,
      };
    }
    if (opt.word === correctWord) {
      return {
        ...opt,
        isSelected: false,
        isCorrect: true,
      };
    }
    return { ...opt, isSelected: false, isCorrect: false };
  });
}

// --- Reducer ---
function quizReducer(
  state: QuizState,
  action: QuizAction & { words: Word[] },
): QuizState {
  const { words } = action;
  const word = words[state.current];
  switch (action.type) {
    case "START_QUESTION":
      return {
        ...state,
        phase: "question",
        timer: 5,
        selected: null,
        answerOptions: generateOptions(words, state.current),
      };
    case "TICK":
      if (state.phase !== "question") return state;
      if (state.timer <= 1 && state.selected === null) {
        return {
          ...state,
          phase: "showingAnswer",
          answerOptions: markAnswers(state.answerOptions, word.word, null),
          results: [...state.results, { word, selected: null, correct: false }],
        };
      }
      return { ...state, timer: state.timer - 1 };
    case "SELECT_ANSWER":
      if (state.phase !== "question") return state;
      const correct = action.answer === word.word;
      return {
        ...state,
        phase: "showingAnswer",
        selected: action.answer,
        answerOptions: markAnswers(
          state.answerOptions,
          word.word,
          action.answer,
        ),
        results: [...state.results, { word, selected: action.answer, correct }],
      };
    case "SHOW_ANSWER":
      return { ...state, phase: "showingAnswer" };
    case "NEXT_QUESTION":
      if (state.current + 1 >= words.length) {
        return { ...state, phase: "finished" };
      }
      return {
        ...state,
        current: state.current + 1,
        phase: "question",
        timer: 5,
        selected: null,
        answerOptions: generateOptions(words, state.current + 1),
      };
    case "FINISH":
      return { ...state, phase: "finished" };
    default:
      return state;
  }
}

// --- Custom Hook ---
export function useTimedQuizMachine(
  words: Word[],
  onReview?: (wordId: string, quality: number) => void,
) {
  const initialState: QuizState = {
    current: 0,
    phase: "question",
    timer: 5,
    selected: null,
    answerOptions: generateOptions(words, 0),
    results: [],
  };
  const [state, dispatch] = useReducer(
    (s: QuizState, a: QuizAction) => quizReducer(s, { ...a, words }),
    initialState,
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevResultsLengthRef = useRef(0);

  // Fire onReview whenever a new result is recorded
  useEffect(() => {
    if (state.results.length <= prevResultsLengthRef.current) return;
    prevResultsLengthRef.current = state.results.length;
    const last = state.results[state.results.length - 1];
    // SM-2 quality: timeout = 0, correct = 4, incorrect = 1
    const quality = last.selected === null ? 0 : last.correct ? 4 : 1;
    onReview?.(last.word.id, quality);
  }, [state.results.length, onReview]);

  // Orchestrate timer and phase transitions
  useEffect(() => {
    switch (state.phase) {
      case "question":
        timerRef.current = setInterval(() => {
          dispatch({ type: "TICK" });
        }, 1000);
        break;
      case "showingAnswer":
        if (timerRef.current) clearInterval(timerRef.current);
        const linger = setTimeout(() => {
          dispatch({ type: "NEXT_QUESTION" });
        }, 800);
        return () => clearTimeout(linger);
      case "finished":
        if (timerRef.current) clearInterval(timerRef.current);
        break;
      default:
        break;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase]);

  const selectAnswer = (answer: string) =>
    dispatch({ type: "SELECT_ANSWER", answer });
  const restart = () => dispatch({ type: "START_QUESTION" });

  return {
    state,
    selectAnswer,
    restart,
  };
}
