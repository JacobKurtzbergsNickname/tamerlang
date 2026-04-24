# Babbel-Inspired Features for TamerLang

This document maps Babbel's most effective learning features to TamerLang's current state. For each feature, it describes what Babbel does, why it matters for learners, and how it would fit into this app.

---

## Current State Summary

TamerLang has two things working in its favor that most PoC apps lack:

- **A full SM-2 spaced repetition backend** (`/srs/` routes, `UserWordProgress` schema) that tracks easiness factor, interval, repetitions, and next-review date per word per user.
- **A working timed multiple-choice quiz** on the frontend.

The critical gap is that these two systems are not connected. The frontend quiz doesn't submit quality ratings to the SRS backend, so no learning history is ever recorded. Fixing this connection is the prerequisite for almost every feature below.

---

## Feature 1: SRS-Driven Review Mode

**What Babbel does:** A dedicated "Vocab Workout" section automatically queues words that are due for review based on spaced repetition scheduling. The learner does not choose what to study — the system surfaces what needs reinforcement.

**Why it matters:** Without this, learners either re-study words they already know (wasted effort) or forget words they studied once and never revisited. SRS is the backbone of long-term retention.

**How it fits here:** The backend already calculates `nextReview` dates. The missing piece is a frontend route (`/review`) that calls `GET /srs/due` to fetch the due queue and runs those words through a quiz, then submits quality ratings (0–5) to `POST /srs/review`. Words answered correctly get longer intervals; words answered incorrectly are scheduled for tomorrow.

---

## Feature 2: Vocabulary Strength Dashboard

**What Babbel does:** Each word in a learner's vocabulary is labelled **Weak**, **Medium**, or **Strong** based on SRS performance. A dashboard shows counts and a visual breakdown.

**Why it matters:** Learners need to see progress. "You know 47 words strongly" is more motivating than a raw count. It also makes weak spots visible and actionable.

**How it fits here:** `UserWordProgress` already stores `repetitions`, `interval`, and `isLearned`. A strength tier can be derived from existing fields:
- **Weak** — `repetitions < 2` or `interval ≤ 1`
- **Medium** — `repetitions 2–4` or `interval 2–7`
- **Strong** — `isLearned === true` or `interval > 7`

A stats endpoint and a dashboard component would surface this. No schema changes needed.

---

## Feature 3: Daily Streak

**What Babbel does:** A streak counter increments each calendar day the learner completes at least one review or lesson. It resets on a missed day. Babbel also gives two "streak freezes" per week that auto-apply on a missed day.

**Why it matters:** Streaks are the single most effective habit-formation mechanism in language apps. A learner who has maintained a 14-day streak has a concrete, emotionally weighted reason to open the app today.

**How it fits here:** The `User` schema needs two new fields: `currentStreak`, `longestStreak`, and `lastActivityDate`. The backend updates these on any `POST /srs/review` call. The frontend displays the streak count prominently on the home page. A streak freeze mechanic can be added later as a bonus feature.

---

## Feature 4: Multiple Exercise Types

**What Babbel does:** Within a single review session, learners encounter different exercise formats. Babbel offers at minimum:
- **Multiple choice** (already implemented here)
- **Flashcard** — See word, flip to reveal translation, self-rate
- **Fill-in-the-blank** — A sentence with a gap; type the missing word
- **Writing production** — No hints; type the full translation from scratch
- **Matching pairs** — Connect words to their translations by dragging or clicking

**Why it matters:** Variety prevents the quiz from becoming mechanical. Each format also tests a different memory pathway: recognition (multiple choice) is easier than recall (writing). Mixing them is more effective than any single format alone.

**How it fits here:** The current `useTimedQuizMachine` is format-agnostic enough that a `questionType` field can be added to the question state. The easiest new format to add is **flashcard** (just show the word, tap to flip, then rate yourself), which requires no answer-validation logic. Fill-in-the-blank requires the fewest UI components after that.

---

## Feature 5: Lesson and Unit Structure

**What Babbel does:** Words are grouped into **Lessons** (~10–15 words each), lessons into **Topics** (e.g., "At the Restaurant"), and topics into **Courses** (e.g., "Beginner A1"). Learners progress through lessons in sequence.

**Why it matters:** Unstructured vocabulary lists are overwhelming. Grouping words thematically (colours, numbers, greetings, food) gives the learner a sense of where they are and where they're going. Completing a lesson feels like a unit of achievement, not just an arbitrary stopping point.

**How it fits here:** The `Word` schema already has a `language` field. Adding a `lesson` and `topic` field to `Word` (or creating a separate `Lesson` collection) would enable grouping. The frontend would show a lesson map rather than a flat word list. Learners could start a lesson (study mode) and then the due-review queue handles long-term retention automatically.

---

## Feature 6: Progress Statistics Page

**What Babbel does:** A dedicated stats view shows: total words learned, lessons completed, cumulative learning time, and a vocabulary strength breakdown. Some versions show a calendar heatmap of activity.

**Why it matters:** Progress visibility is intrinsically motivating. Learners who can see measurable progress are more likely to continue. It also serves as a diagnostic — if strong-word count has stopped growing, something is wrong with the study habit.

**How it fits here:** The SRS backend already tracks `encounters`, `isLearned`, and timestamps. A `GET /users/me/stats` endpoint aggregating this data is straightforward. The frontend stats page would show: words by strength tier, current and longest streak, total reviews completed, and time active.

---

## Feature 7: Daily and Weekly Goals

**What Babbel does:** During onboarding, learners set a weekly lesson target (e.g., "3 lessons per week"). The app tracks progress toward the goal and sends a reminder notification if the week is running short.

**Why it matters:** Vague intentions ("I'll practice when I have time") fail. Concrete, self-chosen targets activate commitment. Hitting the weekly goal also resets the learner's mental frame — a missed day doesn't mean the week is lost.

**How it fits here:** A `weeklyGoal` field on `User` (number of review sessions per week). The frontend home page shows a weekly progress ring (e.g., "3 of 5 sessions this week"). No gamification infrastructure needed beyond a counter.

---

## Feature 8: Achievement Badges

**What Babbel does:** Badges are awarded at meaningful milestones: completing a first lesson, learning 50 words, reaching a 7-day streak, finishing a course. They are displayed on the learner's profile.

**Why it matters:** Badges create discrete, celebratory moments that punctuate the otherwise continuous grind of vocabulary study. They are low-effort to implement but disproportionately effective at marking progress.

**How it fits here:** A `badges` array on the `User` schema, populated server-side when milestone conditions are detected after a review or lesson completion. Start with 5–6 milestones (first review, 10 words strong, 7-day streak, 50 words learned, first lesson complete).

---

## Feature 9: Onboarding Intake and Placement

**What Babbel does:** On first launch, Babbel asks: your native language, reason for learning, current level, and available time per week. For major languages, a placement quiz assigns a CEFR level so intermediate learners don't start from scratch.

**Why it matters:** For an Uzbek-specific app, the equivalent is understanding whether the learner is a heritage speaker, a beginner, or already conversational. This allows the app to surface the right starting lesson and the right word difficulty tier.

**How it fits here:** A short onboarding flow (3–4 screens) that stores `proficiencyLevel` and `learningGoal` on `User`. These fields gate which lessons are shown first and set the default `weeklyGoal`.

---

## Feature 10: Audio Pronunciation

**What Babbel does:** Every word and phrase in Babbel's content is recorded by native speakers (not TTS). Tapping any word plays its audio. Speaking exercises use AI speech recognition to score the learner's pronunciation.

**Why it matters:** Uzbek has sounds absent from English (e.g., retroflex consonants, the back vowel `o'`). Learners without access to native speakers need audio to build correct pronunciation habits from day one.

**How it fits here:** The `Word` schema could add an `audioUrl` field pointing to a CDN-hosted recording. Playing audio on word reveal costs almost nothing UX-wise. Full speech recognition is a larger investment, but passive listening (tap to hear the word) is an independent first step with high value.

---

## Not Recommended (for now)

| Babbel Feature | Reason to skip |
|---|---|
| Live teacher classes | Babbel discontinued this for consumers; operationally complex |
| Full CEFR course hierarchy | Premature — word count is too small to fill multiple CEFR levels |
| Podcasts / 2-minute stories | Requires significant audio content production |
| AI conversation partner | High infrastructure cost; Uzbek NLP models are immature |
| Social leaderboards | Babbel itself avoids these; adds complexity without clear retention benefit |

---

## Recommended Implementation Order

1. **Wire SRS to frontend** — Every other feature depends on learning history being recorded.
2. **Vocabulary strength dashboard** — Immediate payoff from existing SRS data; no new schema.
3. **Daily streak** — Small schema change, high engagement impact.
4. **Flashcard exercise type** — Easiest new format; adds variety with minimal logic.
5. **Lesson/unit structure** — Required before progress tracking is meaningful.
6. **Progress stats page** — Surfaces value of all the above work.
7. **Weekly goals** — Simple target-setting; high perceived value.
8. **Fill-in-the-blank exercise** — More demanding but valuable for recall.
9. **Audio pronunciation** — Independent of everything above; can be done in parallel.
10. **Achievement badges** — Motivating polish once the core loop is solid.
