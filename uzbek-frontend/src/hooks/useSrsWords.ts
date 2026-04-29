"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import type { Word } from "@/types";

interface SrsProgressRecord {
  wordId: string;
  nextReview: string | null;
}

interface BackendWord {
  id: string;
  word: string;
  translation: string;
}

export interface SrsWordsResult {
  words: Word[];
  loading: boolean;
  error: string | null;
  dueCount: number;
  nextReviewAt: Date | null;
  token: string | null;
}

const SESSION_LIMIT = 20;

export function useSrsWords(): SrsWordsResult {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [nextReviewAt, setNextReviewAt] = useState<Date | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1. Obtain access token via server-side route handler
        const tokenRes = await fetch("/api/token");
        if (!tokenRes.ok) throw new Error("Not authenticated");
        const { token: accessToken } = (await tokenRes.json()) as {
          token: string;
        };

        if (cancelled) return;
        setToken(accessToken);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

        // 2. Fetch all words and all SRS progress in parallel
        const [wordsRes, progressRes] = await Promise.all([
          authFetch(`${apiUrl}/words`, {}, accessToken),
          authFetch(`${apiUrl}/srs/progress`, {}, accessToken),
        ]);

        if (!wordsRes.ok) throw new Error("Failed to fetch vocabulary");
        if (!progressRes.ok) throw new Error("Failed to fetch SRS progress");

        const allWords = (await wordsRes.json()) as BackendWord[];
        const allProgress = (await progressRes.json()) as SrsProgressRecord[];

        if (cancelled) return;

        const now = new Date();

        // Index progress by wordId for O(1) lookups
        const progressByWordId = new Map(
          allProgress.map((p) => [p.wordId, p]),
        );

        // Enrolled word IDs (any progress record exists)
        const enrolledIds = new Set(allProgress.map((p) => p.wordId));

        // Due: enrolled with nextReview <= now OR nextReview === null (never reviewed)
        const dueProgress = allProgress
          .filter(
            (p) => p.nextReview === null || new Date(p.nextReview) <= now,
          )
          .sort((a, b) => {
            // null (never reviewed) sorts first
            if (!a.nextReview) return -1;
            if (!b.nextReview) return 1;
            return (
              new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
            );
          });

        const wordMap = new Map<string, Word>(
          allWords.map((w) => [
            w.id,
            { id: w.id, word: w.word, translation: w.translation },
          ]),
        );

        // Due words mapped to Word objects
        const dueWords: Word[] = dueProgress
          .map((p) => wordMap.get(p.wordId))
          .filter((w): w is Word => w !== undefined);

        // New words: in vocabulary but never enrolled in SRS
        const newWords: Word[] = allWords
          .filter((w) => !enrolledIds.has(w.id))
          .map((w) => ({ id: w.id, word: w.word, translation: w.translation }));

        // Session: due first, then new words, capped at SESSION_LIMIT
        const sessionWords = [...dueWords, ...newWords].slice(0, SESSION_LIMIT);

        // Earliest future review time (for "All caught up!" message)
        const futureReviews = allProgress
          .filter((p) => p.nextReview && new Date(p.nextReview) > now)
          .map((p) => new Date(p.nextReview!))
          .sort((a, b) => a.getTime() - b.getTime());

        setWords(sessionWords);
        setDueCount(dueProgress.length);
        setNextReviewAt(futureReviews[0] ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { words, loading, error, dueCount, nextReviewAt, token };
}
