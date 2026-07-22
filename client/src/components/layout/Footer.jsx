import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'How do I log a meal?',
    a: 'Go to the Food page, search for an item via the USDA database, pick a portion, and add it to a meal (breakfast, lunch, dinner, or snack). It shows up on your Dashboard instantly.',
  },
  {
    q: 'Can I add my own custom foods?',
    a: 'Yes. On the Custom Foods page you can manually enter a food with its calories and macros, then log it into meals just like database foods.',
  },
  {
    q: 'How are my daily calorie goals set?',
    a: 'Goals are set on your Profile page. You can change your calorie and water goals anytime; the Dashboard and charts update against them.',
  },
  {
    q: 'How do I reset my password?',
    a: 'On the login page tap "Forgot password?". You can reset via an email link or an SMS OTP sent to the phone number on your account (use the country-code selector).',
  },
  {
    q: 'What is the streak counter?',
    a: 'It counts consecutive days you logged at least one meal. Miss a day and the streak resets.',
  },
  {
    q: 'Can I analyze a recipe?',
    a: 'Yes. On the Recipe page, paste ingredient text and we estimate nutrition using USDA FoodData Central.',
  },
  {
    q: 'How do I export my data?',
    a: 'Use the weekly PDF export from your Dashboard to download a 7-day summary of calories, macros, and water intake.',
  },
];

export default function Footer() {
  const [open, setOpen] = useState(null);

  return (
    <footer className="mt-10 border-t border-brand-200 bg-white/70">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/dashboard" className="flex items-center gap-2 font-extrabold tracking-tight text-black">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-base">🥗</span>
              <span>WhatYou<span className="text-brand-600">Eat</span></span>
            </Link>
            <p className="mt-3 text-sm text-slate-500">
              Track what you eat. Hit your goals. Stay consistent.
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-brand-700">FAQs</h3>
            <ul className="mt-3 space-y-2">
              {FAQS.map((f, i) => {
                const isOpen = open === i;
                return (
                  <li key={i} className="rounded-lg border border-brand-200 bg-brand-50/40">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-black"
                      aria-expanded={isOpen}
                    >
                      <span>{f.q}</span>
                      <span className={`text-brand-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    {isOpen && (
                      <p className="px-3 pb-3 text-sm text-slate-600">{f.a}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-brand-100 pt-4 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} WhatYouEat. All rights reserved.</p>
          <p>Built with the USDA FoodData Central API.</p>
        </div>
      </div>
    </footer>
  );
}
