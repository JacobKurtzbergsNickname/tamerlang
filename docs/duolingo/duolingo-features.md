# Duolingo-Inspired Features for the Uzbek Learning App

This document lists Duolingo features that would meaningfully improve engagement and
learning outcomes for users of this app. Each entry explains what the feature is,
why it matters, and how it relates to the current codebase.

---

## 1. Streak Tracking

**What it is:** A counter that increments each day the user completes at least one
review session. Breaking the streak resets it to zero. Duolingo also offers "streak
shields" — a one-day forgiveness token — to reduce the anxiety of missing a single day.

**Why it helps:** Streaks are the single most powerful daily-retention mechanic in
language learning apps. They create a low-stakes commitment loop: the user doesn't need
to finish a unit, they just need to show up.

**Codebase relevance:** The backend already has a `UserWordProgress` schema with
`createdAt`/`updatedAt` timestamps and a `/srs/review` submission endpoint. Streak
state can be derived from review submission dates with a small addition to the Users
schema (e.g., `currentStreak`, `longestStreak`, `lastReviewDate`).

---

## 2. Daily XP Goal & Experience Points

**What it is:** Users earn XP (experience points) for completing quizzes and reviews.
They set a daily XP goal (e.g., Casual = 10 XP, Regular = 20 XP, Serious = 30 XP,
Intense = 50 XP). A progress bar shows how close they are to today's goal.

**Why it helps:** Gives users a concrete, achievable daily target. Transforms an
open-ended task ("study Uzbek") into a bounded one ("earn 20 XP today"). The daily
goal bar is one of the first things a returning user sees, so it drives re-engagement
at session start.

**Codebase relevance:** XP can be computed server-side from correct answers submitted
to `/srs/review`. The User schema can store `dailyXpGoal` and today's XP can be
aggregated from review history. The frontend `useTimedQuizMachine` already tracks
correct/incorrect per session — this data just needs to be submitted and counted.

---

## 3. Spaced Repetition UI (SRS Integration)

**What it is:** Instead of always showing a random word list, the app surfaces words
that are due for review based on the SM-2 algorithm — words you're about to forget.
A "Review Due" card on the home screen shows how many words need practice today.

**Why it helps:** This is the most evidence-backed feature for long-term vocabulary
retention. The backend already implements SM-2 via `/srs/due` and `/srs/review`, but
the frontend ignores it entirely, loading words from hardcoded `localStorage` data
instead.

**Codebase relevance:** The biggest gap in the current architecture. The frontend
`VocabularyProvider` should fetch from `GET /srs/due` instead of hardcoded data.
After each answer in `useTimedQuizMachine`, a call to `POST /srs/review` should record
the result. This single integration unlocks the most learning value with the least
new backend work.

---

## 4. Multiple Exercise Types

**What it is:** Duolingo uses several distinct question formats in a single session to
prevent monotony and train different cognitive pathways:

| Exercise Type | Description |
|---|---|
| Multiple choice | Select the correct translation (already exists) |
| Tap the pairs | Match a column of words to a column of translations |
| Translate by typing | Free-text input of the translation |
| Word bank ordering | Tap words in the correct order to build a sentence |
| Listen and type | Hear the word, type what you heard |
| Fill in the blank | Sentence with a missing word, choose from options |

**Why it helps:** Variety prevents habituation; typing an answer is much harder (and
more effective) than recognising it in a list. Mixed exercise types in a single session
reflect real Duolingo's "lesson" format, which users find more engaging than a
homogeneous quiz.

**Codebase relevance:** The current `useTimedQuizMachine` supports only multiple choice.
New exercise types would require new action types in the reducer and new UI components
alongside the existing `AnswerOption` and `Translation` components.

---

## 5. Vocabulary Organised by Topic / Skill Tree

**What it is:** Words are grouped into thematic skill units (e.g., Greetings, Numbers,
Food, Family, Travel). Users unlock later units by completing earlier ones. A visual
skill tree or grid shows progress at a glance.

**Why it helps:** Gives learners a sense of curriculum — they know where they are and
what's next. Prevents the "I've been reviewing random words for weeks and feel no
progress" problem. Topic grouping also helps with contextual learning (all food words
together reinforces the category).

**Codebase relevance:** The Word schema currently has `partOfSpeech` and `language`
fields but no topic or unit. Adding a `topic` or `unit` field to the Word schema and
a new `Skill`/`Unit` model (with prerequisite references) would support this. The
frontend would need a new "Skills" page to replace the single timed-test link on the
home page.

---

## 6. Progress Dashboard

**What it is:** A personal stats page showing:
- Total words learned
- Current and longest streak
- Daily/weekly/monthly XP chart
- Words by status (new, learning, mastered)
- Accuracy rate over time

**Why it helps:** Externalises progress that otherwise feels invisible. Seeing "I've
learned 120 words in 3 weeks" is motivating in a way that individual quiz sessions
are not. The dashboard is also a natural re-entry point: users open the app, glance
at their stats, and decide what to study.

**Codebase relevance:** All data for this dashboard exists or can be derived from the
SRS backend (`/srs/progress`, `/srs/due`, review timestamps on `UserWordProgress`).
The frontend just needs a `/dashboard` or `/profile` page to aggregate and display it.

---

## 7. Achievement Badges / Milestones

**What it is:** One-time awards for reaching milestones: first word learned, 7-day
streak, 100 words mastered, 1000 total reviews, etc. Displayed on the user profile.

**Why it helps:** Provides discrete motivational spikes at key moments. Particularly
useful for new users who haven't yet built the habit; early achievements ("First
Lesson!" badge) reward tiny wins that encourage return visits.

**Codebase relevance:** Can be derived entirely from existing data (review counts,
streak length, words with `interval > 21` days as "mastered"). A lightweight
`Achievement` schema with a flag per user is sufficient; no complex computation needed.

---

## 8. Pronunciation Audio

**What it is:** Each word is accompanied by a native-speaker audio clip. A speaker
icon lets the user listen before or after answering. Optionally, a "listen and choose"
exercise type plays audio and asks the user to pick the correct written form.

**Why it helps:** Uzbek has sounds not present in English (e.g., the letter `oʻ`, `gʻ`,
and uvular stops). Without audio, users learn to read without knowing how to pronounce,
which undermines real-world use. Audio also benefits users who learn better via auditory
channels.

**Codebase relevance:** The Word schema would need an optional `audioUrl` field. Audio
files could be stored externally (e.g., AWS S3) and referenced by URL, or generated
via a TTS API (e.g., Google Cloud TTS, which supports Uzbek). The frontend
`Translation` component would display a play button when `audioUrl` is present.

---

## 9. Mistake Review ("Practice Weak Words")

**What it is:** After a session the app offers a "review your mistakes" mode that
re-queues only the words the user got wrong in that session, or words with historically
low accuracy. In Duolingo this appears as "Practice" in the skill menu.

**Why it helps:** Immediate re-exposure to mistakes dramatically improves retention
compared to waiting for the next scheduled review. It also gives users a sense of
closure after a difficult session.

**Codebase relevance:** The `useTimedQuizMachine` already tracks per-question
`isCorrect` in its results array. A "Retry mistakes" button on the results screen
could re-run the quiz with only the incorrectly answered words — no backend changes
needed for the basic version.

---

## 10. Leaderboards & Social Features

**What it is:** A weekly XP leaderboard among friends or in a league (Bronze → Silver
→ Gold → Diamond). Users can follow each other, see friends' streaks, and send
encouragement notifications.

**Why it helps:** Social accountability and friendly competition are strong extrinsic
motivators, especially for users whose intrinsic motivation fluctuates week to week.
Even passive social presence (seeing that a friend studied today) increases engagement.

**Codebase relevance:** Requires the most new backend work of any feature on this list.
Would need a `Friendship` or `Follow` model, weekly XP aggregation endpoints, and
frontend notifications. A lightweight first version could be a simple friends list
with shared streak visibility, deferring leagues to a later iteration.

---

## 11. Contextual Example Sentences

**What it is:** Each vocabulary word is shown with one or two example sentences
demonstrating its use in context. In Duolingo, tapping a word in an exercise reveals
its translation and an example sentence.

**Why it helps:** Isolated word memorisation plateaus quickly. Seeing a word in a
sentence anchors its meaning, illustrates grammar patterns, and helps users learn
collocation (what words naturally appear next to the target word).

**Codebase relevance:** The existing `Word` schema has no sentence field. Adding an
optional `exampleSentences: string[]` field to the schema and surfacing it in the
quiz "show answer" phase would be sufficient for a first version. The planned `Phrase`
model (already in the backlog) would extend this further.

---

## 12. Daily Reminder Notifications

**What it is:** Push or email notifications sent at a user-configured time ("Remind me
at 20:00") if the user hasn't studied that day. Duolingo's Duo owl notifications became
a cultural meme precisely because they work.

**Why it helps:** Habit formation research shows that reminders timed to a consistent
slot in the day (after dinner, during commute) are the most effective trigger for
sustaining a new habit. Without reminders, users who skip one day are likely to skip
many more.

**Codebase relevance:** Requires a notification service not currently in the stack
(e.g., web push via the Push API, or transactional email via SendGrid/Resend). The
backend would need a scheduled job (cron) to check which users haven't reviewed today
and dispatch notifications. User preferences (`notificationTime`, `notificationEnabled`)
would be stored on the User schema.

---

## Summary Table

| # | Feature | Effort | Impact | Backend changes needed |
|---|---|---|---|---|
| 1 | Streak Tracking | Low | High | Add streak fields to User |
| 2 | Daily XP Goal | Low | High | Add XP aggregation to review endpoint |
| 3 | SRS UI Integration | Medium | Very High | None — backend already exists |
| 4 | Multiple Exercise Types | Medium | High | None for most types |
| 5 | Topic / Skill Tree | High | High | New Unit/Skill model + Word.topic field |
| 6 | Progress Dashboard | Medium | High | None — data already available |
| 7 | Achievement Badges | Low | Medium | New Achievement schema |
| 8 | Pronunciation Audio | Medium | High | Add audioUrl to Word schema |
| 9 | Mistake Review | Low | Medium | None — frontend only |
| 10 | Leaderboards | High | Medium | New social models + aggregation |
| 11 | Example Sentences | Low | Medium | Add exampleSentences to Word schema |
| 12 | Daily Reminders | High | High | Notification service + cron job |
