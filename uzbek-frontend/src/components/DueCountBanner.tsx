"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/api";

interface DueRecord {
  wordId: string;
  nextReview: string | null;
}

export function DueCountBanner() {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [nextReviewAt, setNextReviewAt] = useState<Date | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const tokenRes = await fetch("/api/token");
        if (!tokenRes.ok) return;
        const { token } = (await tokenRes.json()) as { token: string };

        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
        const [dueRes, progressRes] = await Promise.all([
          authFetch(`${apiUrl}/srs/due?limit=100`, {}, token),
          authFetch(`${apiUrl}/srs/progress`, {}, token),
        ]);

        if (!dueRes.ok || !progressRes.ok) return;

        const due = (await dueRes.json()) as DueRecord[];
        const progress = (await progressRes.json()) as DueRecord[];

        setDueCount(due.length);

        const now = new Date();
        const future = progress
          .filter((p) => p.nextReview && new Date(p.nextReview) > now)
          .map((p) => new Date(p.nextReview!))
          .sort((a, b) => a.getTime() - b.getTime());
        setNextReviewAt(future[0] ?? null);
      } catch {
        // Silently ignore — banner is non-critical
      }
    }
    void load();
  }, []);

  if (dueCount === null) return null;

  if (dueCount === 0) {
    const nextLabel = nextReviewAt
      ? nextReviewAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;
    return (
      <div className="mt-8 p-4 rounded-lg bg-green-900 text-green-100 text-center">
        <p className="text-lg font-semibold">All caught up!</p>
        {nextLabel && (
          <p className="text-sm text-green-300">
            Next review available at {nextLabel}.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-lg">
        <span className="font-bold text-yellow-300">{dueCount}</span>{" "}
        {dueCount === 1 ? "word" : "words"} due for review today
      </p>
      <Link href="/review">
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg hover:bg-blue-600 transition font-semibold">
          Start Review
        </button>
      </Link>
    </div>
  );
}
