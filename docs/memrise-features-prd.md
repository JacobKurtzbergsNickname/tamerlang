# Memrise Feature Parity — Product Requirements

This document lists Memrise features relevant to an Uzbek vocabulary learning app, prioritised by learning impact and implementation cost.

---

## Feature List

### 1. Spaced Repetition System (SRS)

**What Memrise does:** Schedules each word for review at increasing intervals (1 day → 3 days → 1 week → …) based on whether the user answered correctly. Words answered incorrectly are bumped back to a shorter interval.

**Why it matters:** SRS is the single highest-impact feature for long-term retention. Without it, users must manually decide what to review, and they typically over-practise easy words and neglect hard ones.

**Current state:** The app has a timed quiz but no persistence of results or scheduling logic.

---

### 2. Difficult Words Queue

**What Memrise does:** Automatically surfaces words the user has answered incorrectly multiple times into a dedicated "Difficult Words" review session.

**Why it matters:** Complements SRS by giving users an explicit shortcut to drill their weakest vocabulary without waiting for the next scheduled interval.

**Current state:** Results are tracked per session in `useTimedQuizMachine` but not persisted.

---

### 3. Streak Tracking

**What Memrise does:** Tracks consecutive days of learning and displays the streak prominently. Breaking the streak resets the counter. An optional "streak shield" can protect against a single missed day.

**Why it matters:** Streaks are one of the most effective habit-forming mechanics in language apps. They create a low-cost daily commitment that compounds over time.

**Current state:** Not implemented.

---

### 4. Progress Dashboard & Statistics

**What Memrise does:** Shows total words learned, accuracy percentages per session, weekly activity graphs, and per-word history.

**Why it matters:** Visible progress motivates continued use and helps users identify weak areas (e.g. a particular part of speech or word group).

**Current state:** Not implemented.

---

### 5. Multiple Quiz Modes

**What Memrise does:** Offers several distinct learning modes:

| Mode | Description |
|------|-------------|
| Classic Review | Untimed multiple-choice |
| Speed Review | Timed multiple-choice (similar to current implementation) |
| Typing Practice | User types the translation (harder, higher retention) |
| Listening Skills | Audio clip played; user selects or types the word |
| Flashcard Mode | Show word → self-report correct/incorrect |

**Why it matters:** Variety reduces fatigue and exercises different recall pathways. Typing in particular is significantly more effective for retention than recognition.

**Current state:** Only a timed multiple-choice mode exists.

---

### 6. Audio Pronunciation

**What Memrise does:** Plays a native-speaker audio clip for each word during review. Users can replay it on demand.

**Why it matters:** Uzbek pronunciation is non-trivial for English speakers. Hearing the word alongside reading it improves both pronunciation and recall.

**Current state:** The `Word` schema has no audio field. No audio playback is implemented.

---

### 7. Example Sentences / Contextual Usage

**What Memrise does:** Displays a short example sentence using the target word, helping users understand usage beyond a bare translation.

**Why it matters:** Vocabulary in context is retained significantly better than isolated word-translation pairs. It also disambiguates polysemous words.

**Current state:** The `Word` schema has no `exampleSentence` field.

---

### 8. Daily Goal Setting

**What Memrise does:** Lets users choose a daily target (e.g. 5, 10, 15, or 20 new words per day) and shows progress toward that goal within the session.

**Why it matters:** Explicit goals convert vague intent ("I want to learn Uzbek") into a concrete, completable task per day.

**Current state:** Not implemented.

---

### 9. Learning Reminders / Notifications

**What Memrise does:** Sends push or email notifications at a user-configured time to prompt the daily session.

**Why it matters:** Reminders are the primary driver of streak maintenance. Without them, users rely on self-motivation alone.

**Current state:** Not implemented.

---

### 10. Leaderboards & Social Features

**What Memrise does:** Ranks friends and global users by weekly points. Users earn points per correct answer and per session completed.

**Why it matters:** Social competition is a secondary but meaningful motivator, especially for users who are competitive or have study partners.

**Current state:** Not implemented. Requires a points/XP system as a prerequisite.

---

### 11. User-Created Mnemonics ("Mems")

**What Memrise does:** Allows any user to attach an image, phrase, or memory cue to a word. Other users can vote the best mems up, and the top mem is shown during review.

**Why it matters:** Mnemonics dramatically increase retention for hard words. Community-sourced mems are especially powerful because other learners have faced the same difficulty.

**Current state:** Not implemented. Would require a `mems` sub-collection on the `Word` schema and upvoting logic.

---

### 12. Offline Mode

**What Memrise does:** Pre-downloads a course so it can be studied without an internet connection. Results sync when connectivity is restored.

**Why it matters:** Language learners often study during commutes or travel where connectivity is unreliable.

**Current state:** Words are already stored in `localStorage`, so the quiz works offline. The gap is that the SRS sync and new word fetch require connectivity.

---

## Priority Summary

| # | Feature | Learning Impact | Implementation Effort | Priority |
|---|---------|----------------|----------------------|----------|
| 1 | Spaced Repetition | Very High | Medium | P0 |
| 2 | Difficult Words Queue | High | Low | P0 |
| 3 | Streak Tracking | High | Low | P1 |
| 4 | Progress Dashboard | Medium | Medium | P1 |
| 5 | Multiple Quiz Modes | High | Medium | P1 |
| 6 | Audio Pronunciation | High | High | P2 |
| 7 | Example Sentences | Medium | Low | P2 |
| 8 | Daily Goal Setting | Medium | Low | P2 |
| 9 | Learning Reminders | Medium | Medium | P2 |
| 10 | Leaderboards | Low | High | P3 |
| 11 | User Mnemonics | Medium | High | P3 |
| 12 | Offline Mode | Low | Low | P3 |
