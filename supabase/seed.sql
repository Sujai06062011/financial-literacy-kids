-- =====================================================================
-- MoneyQuest Kids — Starter Content
-- Run this AFTER schema.sql. Safe to re-run (it clears and re-inserts).
-- =====================================================================

truncate table public.quizzes, public.lessons, public.badges restart identity cascade;

-- ---------------------------------------------------------------------
-- LESSONS (9 topics)
-- ---------------------------------------------------------------------

insert into public.lessons (slug, title, description, icon, order_index, content) values
('money-basics', 'Money Basics', 'What money is and why we use it', '💰', 1,
 'Money is anything people agree to accept in exchange for goods and services. Long ago, people traded things directly — a farmer might swap wheat for a pair of shoes. This was called bartering, and it was slow because you had to find someone who wanted exactly what you had.

Coins and notes solve that problem. Everyone agrees they are valuable, so you can sell your old cricket bat for money, then use that same money to buy a book — no need to find someone who wants a cricket bat AND happens to sell books.

Today, money also exists digitally — in bank accounts, UPI apps, and cards. It is still the same idea: a trusted way to store and exchange value.

Understanding money is the first step to using it wisely — earning it, saving it, spending it thoughtfully, and eventually growing it.'),

('needs-vs-wants', 'Needs vs Wants', 'Telling the difference before you spend', '🧩', 2,
 'A need is something you must have to live and be safe and healthy — food, water, a place to live, clothes, school supplies, and medicine.

A want is something nice to have but not essential — the latest video game, a fancy pair of sneakers, extra chocolates, or a new phone when your old one works fine.

Smart money habits start with sorting your spending into needs first, then wants — after your needs (and some savings) are covered, you can enjoy your wants guilt-free.

A simple trick: before buying something, ask "Will this matter to me in a month?" If the honest answer is no, it is probably a want, not a need.'),

('saving', 'Saving', 'Paying your future self first', '🐷', 3,
 'Saving means setting aside money now instead of spending all of it, so you have it later for something bigger or for emergencies.

A great habit is "pay yourself first" — as soon as you receive money (allowance, gift, or earnings), move a portion straight into savings before you spend on anything else.

Having a clear savings goal — like a bicycle, a book, or a gift for someone — makes saving feel exciting instead of hard, because every rupee saved is visible progress toward something you want.

Even saving a small, consistent amount regularly adds up faster than people expect, thanks to something called compounding, which you will learn more about in the Investing lesson.'),

('budgeting', 'Budgeting', 'Making a simple plan for your money', '📊', 4,
 'A budget is simply a plan for your money — deciding ahead of time how much you will spend, save, and give, instead of figuring it out after the money is already gone.

A popular and simple rule for beginners is the 50/30/20 rule: roughly 50% for needs, 30% for wants, and 20% for savings. It does not have to be exact — the goal is balance.

To build a budget: 1) write down all the money you receive, 2) list your regular needs and wants, 3) decide an amount for savings first, 4) track what you actually spend and compare it to your plan.

Budgets are not about restriction — they are about control. A good budget means your money goes where YOU decide, not wherever it happens to disappear to.'),

('banking', 'Banking', 'What banks do with your money', '🏦', 5,
 'A bank is a safe place to keep money. Instead of keeping cash at home where it could be lost or stolen, you can deposit it into a bank account.

Banks also pay you a small amount extra over time for keeping your money with them — this is called interest. It is the bank''s way of thanking you, and it is also a preview of how investing works.

A savings account is the type of account best suited for students — it is simple, safe, and usually lets you deposit or withdraw money whenever you need to, often with the help of a parent or guardian.

Banks also lend money to other people (like for buying a house), and interest is part of how they can afford to do that responsibly.'),

('upi', 'UPI & Digital Payments', 'How instant digital payments work in India', '📱', 6,
 'UPI (Unified Payments Interface) lets people in India send and receive money instantly using just a phone, without needing cash or even the other person''s bank details.

To use UPI, you link a bank account to a UPI app, create a secure PIN, and then can pay by scanning a QR code, entering a UPI ID, or entering a phone number.

Digital payments are convenient, but the same money rules still apply — a fast payment can still be an impulsive one! Always double-check the amount and the receiver before confirming a UPI payment.

Never share your UPI PIN or OTP with anyone, not even someone claiming to be from the bank — this is one of the most important money-safety rules for the digital age.'),

('investing', 'Investing', 'Making your money grow over time', '📈', 7,
 'Investing means putting your money into something with the goal of it growing over time, instead of just sitting still in a piggy bank.

A key idea in investing is compounding — when the money you earn also starts earning more money. Over many years, even small amounts can grow surprisingly large because of compounding.

Investing usually involves some risk — the value can go up or down — which is different from a savings account. That is why investing is generally meant for money you will not need soon, and is best done with guidance from a trusted adult.

As a student, the most valuable thing you can "invest" right now is time — learning good money habits early gives your future investments decades to grow.'),

('insurance', 'Insurance', 'Protecting against the unexpected', '🛡️', 8,
 'Insurance is a way to protect yourself financially from unexpected, costly events — like a medical emergency, an accident, or damage to a home.

Here is the basic idea: many people each pay a small regular amount (called a premium) into a shared pool. If something bad happens to one of them, the pool pays for the loss — so no single person has to bear the entire cost alone.

Common types include health insurance (medical bills), life insurance (protects a family if something happens to the earning member), and vehicle insurance (accidents and damage).

Insurance will not make you money like investing does — its job is to prevent one bad event from wiping out everything you have saved.'),

('cyber-safety', 'Cyber Safety', 'Keeping your money safe online', '🔒', 9,
 'As more money moves online, protecting it from scams and fraud is just as important as earning and saving it.

Golden rule: never share your passwords, PINs, OTPs, or card details with anyone — not on a call, not in a message, not even if they claim to be your bank. Real banks never ask for your PIN or OTP.

Be suspicious of offers that sound too good to be true — like "you won a prize, just pay a small fee to claim it" — this is one of the most common online scams.

Always check that a website or app is genuine before entering any payment details, and tell a trusted adult immediately if something feels wrong. When in doubt, don''t click, don''t pay, don''t share.');

-- ---------------------------------------------------------------------
-- QUIZZES (5 questions per lesson)
-- ---------------------------------------------------------------------

insert into public.quizzes (lesson_id, question, option_a, option_b, option_c, option_d, correct_option, order_index) values
((select id from public.lessons where slug='money-basics'), 'What did people use before money existed, to trade goods directly?', 'Bartering', 'Banking', 'Investing', 'Budgeting', 'a', 1),
((select id from public.lessons where slug='money-basics'), 'Why is money more useful than bartering?', 'It looks nicer', 'Everyone agrees to accept it, so trade is easier', 'It never runs out', 'It grows on trees', 'b', 2),
((select id from public.lessons where slug='money-basics'), 'Which of these is a form of digital money?', 'A gold coin', 'A UPI payment', 'A seashell', 'A barter trade', 'b', 3),
((select id from public.lessons where slug='money-basics'), 'What is the first smart step in using money wisely?', 'Spending it all quickly', 'Understanding what it is and how it works', 'Hiding it from everyone', 'Ignoring it', 'b', 4),
((select id from public.lessons where slug='money-basics'), 'Money is best described as:', 'Something only adults can understand', 'A trusted way to store and exchange value', 'A type of toy', 'Something with no rules', 'b', 5),

((select id from public.lessons where slug='needs-vs-wants'), 'Which of these is a NEED?', 'A new video game', 'School shoes', 'Extra chocolates', 'A fancy phone case', 'b', 1),
((select id from public.lessons where slug='needs-vs-wants'), 'Which of these is a WANT?', 'Drinking water', 'A place to live', 'The newest sneakers', 'Medicine when sick', 'c', 2),
((select id from public.lessons where slug='needs-vs-wants'), 'What should you usually pay for first?', 'Wants', 'Needs', 'Whatever is on sale', 'Whatever a friend buys', 'b', 3),
((select id from public.lessons where slug='needs-vs-wants'), 'A helpful question before buying a want is:', '"Will this matter to me in a month?"', '"Is it pink?"', '"Does everyone else have it?"', '"Is it the most expensive one?"', 'a', 4),
((select id from public.lessons where slug='needs-vs-wants'), 'Needs vs wants thinking mainly helps you:', 'Spend faster', 'Make smarter spending choices', 'Avoid saving', 'Skip budgeting', 'b', 5),

((select id from public.lessons where slug='saving'), '"Pay yourself first" means:', 'Buy yourself a gift first', 'Set aside savings before spending on anything else', 'Spend on wants first', 'Pay your friends back first', 'b', 1),
((select id from public.lessons where slug='saving'), 'Why do savings goals help?', 'They make saving feel exciting and visible', 'They make saving harder', 'They are required by banks', 'They stop you from ever spending', 'a', 2),
((select id from public.lessons where slug='saving'), 'What helps money saved grow faster over time?', 'Hiding it under a pillow', 'Compounding', 'Spending it immediately', 'Ignoring it', 'b', 3),
((select id from public.lessons where slug='saving'), 'Saving regularly, even small amounts, is:', 'Useless', 'Better than not saving at all', 'Only for adults', 'Illegal for kids', 'b', 4),
((select id from public.lessons where slug='saving'), 'A good reason to save money is for:', 'Emergencies and future goals', 'Losing it faster', 'Nothing in particular', 'Giving it all away immediately', 'a', 5),

((select id from public.lessons where slug='budgeting'), 'A budget is best described as:', 'A punishment', 'A plan for your money', 'A type of bank', 'A savings goal only', 'b', 1),
((select id from public.lessons where slug='budgeting'), 'In the 50/30/20 rule, what does the 20% usually represent?', 'Wants', 'Needs', 'Savings', 'Gifts', 'c', 2),
((select id from public.lessons where slug='budgeting'), 'What is the first step in building a simple budget?', 'Spend first, plan later', 'Write down all money you receive', 'Ignore your needs', 'Copy a friend''s budget exactly', 'b', 3),
((select id from public.lessons where slug='budgeting'), 'Budgeting mainly gives you:', 'Less money', 'Control over where your money goes', 'More debt', 'Nothing useful', 'b', 4),
((select id from public.lessons where slug='budgeting'), 'Tracking your actual spending against your plan helps you:', 'Stay on budget', 'Forget your goals', 'Spend more randomly', 'Avoid saving', 'a', 5),

((select id from public.lessons where slug='banking'), 'What is a bank mainly used for?', 'Playing games', 'Keeping money safe', 'Buying snacks only', 'Watching videos', 'b', 1),
((select id from public.lessons where slug='banking'), 'What is "interest" in banking?', 'A fee you must pay to open an account', 'Extra money the bank pays you for keeping funds with them', 'A type of ATM card', 'A type of loan only', 'b', 2),
((select id from public.lessons where slug='banking'), 'Which account type is best suited for students?', 'Business loan account', 'Savings account', 'Investment fund', 'Credit line', 'b', 3),
((select id from public.lessons where slug='banking'), 'Why is a bank safer than keeping cash at home?', 'It is not safer', 'It reduces risk of loss or theft', 'Banks pay no interest', 'Cash is always safer', 'b', 4),
((select id from public.lessons where slug='banking'), 'Banks use deposited money to also:', 'Delete it', 'Lend to others responsibly', 'Hide it forever', 'Give it away randomly', 'b', 5),

((select id from public.lessons where slug='upi'), 'UPI stands for:', 'United Payment India', 'Unified Payments Interface', 'Universal Price Index', 'United Personal Investment', 'b', 1),
((select id from public.lessons where slug='upi'), 'What do you need to set up before using UPI?', 'A secure PIN', 'A public password shared with friends', 'Nothing at all', 'A printed cheque', 'a', 2),
((select id from public.lessons where slug='upi'), 'Which of these is safe to share to receive a UPI payment?', 'Your UPI ID / QR code', 'Your UPI PIN', 'An OTP you received', 'Your bank password', 'a', 3),
((select id from public.lessons where slug='upi'), 'Before confirming a UPI payment, you should:', 'Confirm instantly without checking', 'Double-check the amount and receiver', 'Share your PIN with the receiver', 'Turn off your phone', 'b', 4),
((select id from public.lessons where slug='upi'), 'If someone calls asking for your UPI PIN, you should:', 'Share it if they sound official', 'Never share it — hang up and tell an adult', 'Share only half of it', 'Share it over text instead', 'b', 5),

((select id from public.lessons where slug='investing'), 'Investing mainly means:', 'Spending money immediately', 'Putting money into something to grow over time', 'Hiding money forever', 'Giving money away', 'b', 1),
((select id from public.lessons where slug='investing'), 'Compounding means:', 'Money staying exactly the same forever', 'Earnings on your money start earning more money too', 'Losing money on purpose', 'A type of bank fee', 'b', 2),
((select id from public.lessons where slug='investing'), 'Compared to a savings account, investing usually involves:', 'Zero risk', 'Some risk — value can go up or down', 'Guaranteed daily profit', 'No adult guidance needed', 'b', 3),
((select id from public.lessons where slug='investing'), 'Investing is generally best done with:', 'No planning at all', 'Money you will not need soon, with adult guidance', 'Your entire allowance today', 'Borrowed money from friends', 'b', 4),
((select id from public.lessons where slug='investing'), 'As a student, your biggest investing advantage is:', 'Unlimited money', 'Time — good habits started early have decades to grow', 'Access to loans', 'Ignoring savings', 'b', 5),

((select id from public.lessons where slug='insurance'), 'Insurance mainly helps protect you from:', 'Boredom', 'Unexpected, costly events', 'Doing homework', 'Making friends', 'b', 1),
((select id from public.lessons where slug='insurance'), 'The regular amount paid for insurance is called a:', 'Premium', 'Dividend', 'Discount', 'Penalty', 'a', 2),
((select id from public.lessons where slug='insurance'), 'Health insurance is mainly meant to help with:', 'Buying video games', 'Medical bills', 'School fees', 'Vacation costs', 'b', 3),
((select id from public.lessons where slug='insurance'), 'Insurance works because:', 'One person pays for everyone forever', 'Many people share small costs so no one bears a big loss alone', 'It guarantees you will get rich', 'It replaces the need to save', 'b', 4),
((select id from public.lessons where slug='insurance'), 'Unlike investing, insurance is designed to:', 'Grow your money quickly', 'Prevent one bad event from wiping out your savings', 'Replace a bank account', 'Pay you interest', 'b', 5),

((select id from public.lessons where slug='cyber-safety'), 'What should you NEVER share with anyone, even your bank?', 'Your name', 'Your PIN or OTP', 'Your school name', 'Your favorite color', 'b', 1),
((select id from public.lessons where slug='cyber-safety'), 'An offer saying "you won a prize, just pay a small fee" is usually:', 'A great deal', 'A common online scam', 'Always genuine', 'From your school', 'b', 2),
((select id from public.lessons where slug='cyber-safety'), 'If something online feels wrong, you should:', 'Ignore it and continue', 'Tell a trusted adult immediately', 'Share your password to check', 'Send money to confirm', 'b', 3),
((select id from public.lessons where slug='cyber-safety'), 'Real banks will:', 'Call and ask for your PIN', 'Never ask for your PIN or OTP', 'Text you their password', 'Ask you to share your card details', 'b', 4),
((select id from public.lessons where slug='cyber-safety'), 'Before entering payment details on a website, you should:', 'Check that it is genuine and trusted', 'Enter details on any site quickly', 'Share the site with strangers', 'Skip checking, it is a waste of time', 'a', 5);

-- ---------------------------------------------------------------------
-- BADGES
-- ---------------------------------------------------------------------

insert into public.badges (name, icon, description, criteria_type, criteria_value) values
('First Steps', '👣', 'Complete your very first lesson', 'lessons_completed', 1),
('Halfway Hero', '🏅', 'Complete 5 lessons', 'lessons_completed', 5),
('Money Master', '👑', 'Complete all 9 lessons', 'lessons_completed', 9),
('Quiz Whiz', '🧠', 'Score a perfect 100% on any quiz', 'perfect_quiz', 1),
('Streak Star', '🔥', 'Keep a 5-day learning streak', 'streak', 5),
('Super Saver', '🐷', 'Reach one of your savings goals', 'savings_goal', 1);
