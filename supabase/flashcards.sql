-- =====================================================================
-- MoneyQuest Kids — Flashcards add-on
-- Run this AFTER schema.sql + seed.sql have already been run once.
-- Safe to re-run (it clears and re-inserts just the flashcards table).
-- =====================================================================

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  lesson_id integer not null references public.lessons (id) on delete cascade,
  front text not null,
  back text not null,
  icon text default '💡',
  order_index integer not null default 0
);

alter table public.flashcards enable row level security;

drop policy if exists "flashcards_select" on public.flashcards;
create policy "flashcards_select" on public.flashcards
  for select using (auth.role() = 'authenticated');

truncate table public.flashcards restart identity cascade;

insert into public.flashcards (lesson_id, front, back, icon, order_index) values
((select id from public.lessons where slug='money-basics'), 'What is money?', 'Anything people agree to accept in exchange for goods and services.', '💰', 1),
((select id from public.lessons where slug='money-basics'), 'What is bartering?', 'Trading goods directly without money — like swapping wheat for shoes.', '🔄', 2),
((select id from public.lessons where slug='money-basics'), 'Why is money better than bartering?', 'You don''t need to find someone who wants exactly what you have.', '✅', 3),
((select id from public.lessons where slug='money-basics'), 'Is a UPI payment real money?', 'Yes! It''s digital money — same value, stored electronically.', '📱', 4),

((select id from public.lessons where slug='needs-vs-wants'), 'What''s a NEED?', 'Something essential to live safely — food, water, shelter, medicine.', '🍎', 1),
((select id from public.lessons where slug='needs-vs-wants'), 'What''s a WANT?', 'Something nice to have but not essential — games, sweets, fancy shoes.', '🎈', 2),
((select id from public.lessons where slug='needs-vs-wants'), 'What should you fund first?', 'Needs first, then wants — after some savings too.', '1️⃣', 3),
((select id from public.lessons where slug='needs-vs-wants'), 'Quick test before buying?', 'Ask: "Will this matter to me in a month?" If no, it''s probably a want.', '❓', 4),

((select id from public.lessons where slug='saving'), '"Pay yourself first" means?', 'Set aside savings before spending on anything else.', '🪙', 1),
((select id from public.lessons where slug='saving'), 'Why set a savings goal?', 'It makes saving feel exciting, with visible progress.', '🎯', 2),
((select id from public.lessons where slug='saving'), 'What helps savings grow faster?', 'Compounding — earning more on what you''ve already saved.', '📈', 3),
((select id from public.lessons where slug='saving'), 'Does saving a little count?', 'Yes! Small regular amounts add up faster than most people expect.', '🐷', 4),

((select id from public.lessons where slug='budgeting'), 'What is a budget?', 'A plan for your money — deciding ahead how much to spend, save, and give.', '📊', 1),
((select id from public.lessons where slug='budgeting'), 'What is the 50/30/20 rule?', 'Roughly 50% needs, 30% wants, 20% savings.', '⚖️', 2),
((select id from public.lessons where slug='budgeting'), 'First step to budgeting?', 'Write down all the money you receive.', '✍️', 3),
((select id from public.lessons where slug='budgeting'), 'What does a budget give you?', 'Control — your money goes where YOU decide.', '🕹️', 4),

((select id from public.lessons where slug='banking'), 'What is a bank for?', 'A safe place to keep your money instead of at home.', '🏦', 1),
((select id from public.lessons where slug='banking'), 'What is interest?', 'Extra money the bank pays you for keeping funds with them.', '➕', 2),
((select id from public.lessons where slug='banking'), 'Best account type for students?', 'A savings account — simple, safe, and flexible.', '🎓', 3),
((select id from public.lessons where slug='banking'), 'What do banks do with deposits?', 'Lend to others responsibly — part of how they can pay interest.', '🤝', 4),

((select id from public.lessons where slug='upi'), 'What does UPI stand for?', 'Unified Payments Interface.', '📲', 1),
((select id from public.lessons where slug='upi'), 'What do you need to use UPI?', 'A bank account linked to a UPI app, and a secure PIN.', '🔑', 2),
((select id from public.lessons where slug='upi'), 'Safe to share to receive money?', 'Your UPI ID or QR code — never your PIN or OTP.', '🧾', 3),
((select id from public.lessons where slug='upi'), 'Before confirming a payment?', 'Double-check the amount and the receiver.', '🔍', 4),

((select id from public.lessons where slug='investing'), 'What is investing?', 'Putting money into something with the goal of it growing over time.', '📈', 1),
((select id from public.lessons where slug='investing'), 'What is compounding?', 'When your earnings start earning more money too.', '🔁', 2),
((select id from public.lessons where slug='investing'), 'Investing vs saving — what''s different?', 'Investing usually carries more risk — value can go up or down.', '⚠️', 3),
((select id from public.lessons where slug='investing'), 'A student''s biggest investing advantage?', 'Time — good habits started early have decades to grow.', '⏳', 4),

((select id from public.lessons where slug='insurance'), 'What is insurance for?', 'Protecting against unexpected, costly events.', '🛡️', 1),
((select id from public.lessons where slug='insurance'), 'What is a premium?', 'The regular amount you pay for insurance.', '💳', 2),
((select id from public.lessons where slug='insurance'), 'How does insurance work?', 'Many people share small costs so no one bears a big loss alone.', '🤲', 3),
((select id from public.lessons where slug='insurance'), 'Insurance vs investing?', 'Insurance protects your savings; it doesn''t grow your money.', '🔒', 4),

((select id from public.lessons where slug='cyber-safety'), 'Never share this with anyone', 'Your PIN or OTP — not even with your bank.', '🚫', 1),
((select id from public.lessons where slug='cyber-safety'), '"You won a prize, just pay a fee" — what is this?', 'A common online scam.', '🎣', 2),
((select id from public.lessons where slug='cyber-safety'), 'Something feels wrong online — what now?', 'Tell a trusted adult immediately.', '🙋', 3),
((select id from public.lessons where slug='cyber-safety'), 'Do real banks ask for your PIN?', 'Never. Real banks never ask for your PIN or OTP.', '🏦', 4);
