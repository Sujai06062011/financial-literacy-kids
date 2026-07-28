# 💰 MoneyQuest Kids

Live site: https://financial-literacy-kids.vercel.app

**Learn • Play • Save • Grow**

A colorful, gamified financial-literacy website for students — built with plain
HTML, CSS and JavaScript on the frontend, and [Supabase](https://supabase.com)
(Auth + Postgres database + Row Level Security) as the entire backend.
There is no Node.js server: the browser talks directly and securely to Supabase.

## ✨ Features

- Email/password login & registration (Supabase Auth)
- Dashboard with coins, levels, streaks, and a savings goal tracker
- 9 financial-literacy lessons, each with a 5-question quiz (score + timer + answer review)
- 3 mini-games: Smart Shopping, Budget Builder, Needs vs Wants
- Auto-awarded badges + a downloadable PDF certificate after finishing every lesson
- A one-page Admin Dashboard with summary stats and Chart.js charts
- Every table protected by Row Level Security — students can only ever see their own data

## 🗂️ Project structure

```
moneyquest-kids/
├── index.html              # Login
├── register.html           # Student registration
├── dashboard.html          # Coins, level, streak, savings, modules
├── lesson.html             # ONE template for all 9 lessons (?slug=...)
├── quiz.html                # ONE template for all quizzes (?slug=...)
├── achievements.html        # Badges + certificate download
├── savings-goal.html        # Create / update a savings goal
├── admin.html                # Admin-only summary dashboard
├── games/                   # 3 standalone mini-games
├── assets/
│   ├── css/style.css        # The colorful "fun" theme on top of Bootstrap
│   └── js/
│       ├── config.js            # YOUR Supabase URL + anon key go here
│       ├── supabaseClient.js    # Creates the shared Supabase client
│       ├── auth.js              # Login/logout/guard helpers + navbar
│       ├── gamification.js      # Coins, levels, streaks, badges — the "game engine"
│       ├── dashboard.js / lesson.js / quiz.js / achievements.js / savings.js / admin.js
│       └── games/                # One script per mini-game
└── supabase/
    ├── schema.sql            # Tables, triggers, Row Level Security policies
    └── seed.sql              # 9 lessons, 45 quiz questions, 6 badges
```

## 🚀 Setup (one-time)

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → **New project** (free tier is enough).

### 2. Run the database scripts

In your project: **SQL Editor → New query**.

1. Paste the contents of `supabase/schema.sql` and click **Run**.
2. Paste the contents of `supabase/seed.sql` and click **Run**.

This creates every table, the Row Level Security policies, and fills in the
9 lessons / quizzes / badges.

### 3. Get your API keys

**Project Settings → API** — copy the **Project URL** and the **anon public** key.

Open `assets/js/config.js` and paste them in:

```js
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

### 4. (Recommended for a school demo) Turn off email confirmation

**Authentication → Providers → Email** → turn off "Confirm email". This lets a
new student log in immediately after registering, instead of waiting for a
confirmation email — much smoother for a live demo.

### 5. Run the site locally

Because the browser calls Supabase directly, you just need any local static
server (opening `index.html` directly via `file://` can break some browser
security rules, so a local server is best):

```bash
# Option A — Python (already installed on most computers)
python3 -m http.server 5500

# Option B — Node's npx (if you have Node installed)
npx serve .
```

Then open `http://localhost:5500` in your browser.

### 6. Make yourself the admin

Register a normal account on the site once, then in the Supabase **SQL Editor** run:

```sql
update public.profiles set is_admin = true where email = 'your-email@example.com';
```

Log out and back in — you'll now see an **Admin** button in the navbar linking to `admin.html`.

## 🌐 Deploying for free

Any static hosting works since there's no server to run:

- **Netlify**: drag-and-drop the whole project folder onto [app.netlify.com/drop](https://app.netlify.com/drop)
- **GitHub Pages**: push this folder to a GitHub repo → Settings → Pages → deploy from the main branch

No environment variables or build step needed — `assets/js/config.js` already has everything the browser needs.

## 🧠 How the pieces fit together

- **HTML/CSS/JS + Bootstrap 5** — the pages you see and click through.
- **Supabase Auth** — handles sign up / login / sessions.
- **Supabase Postgres** — stores every lesson, quiz, score, goal, and badge.
- **Row Level Security (RLS)** — a lock on every table so a student can only ever read/write their own rows (the one admin account can additionally read everyone's rows, to power the Admin Dashboard).
- **`assets/js/gamification.js`** — the single file that decides how coins, levels, streaks and badges work, so the rules never need to be copy-pasted across pages.

## 🎮 Gamification rules

| Action | Reward |
|---|---|
| Finish a lesson | +20 coins |
| Score 80%+ on a quiz | +30 coins |
| Score below 80% on a quiz | +5 coins |
| Log in on a new day | streak +1 (resets if a day is skipped) |
| Reach a savings goal | +50 coins + "Super Saver" badge |
| Complete all 9 lessons | "Money Master" badge + certificate unlocked |

Levels: **1** Coin Collector (0) → **2** Budget Beginner (100) → **3** Money
Explorer (250) → **4** Smart Saver (450) → **5** Money Master (700+ coins).

## 🔒 Security note

The `anon` key in `config.js` is meant to be public (it's the same key
Supabase expects to ship in any client-side app) — the real protection comes
from the Row Level Security policies in `supabase/schema.sql`, which run on
the database itself and can't be bypassed from the browser.
