import { cn } from '../../utils';

const COUNTRIES = [
  { code: '+91', label: '🇮🇳 India (+91)' },
  { code: '+1', label: '🇺🇸 USA/Canada (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
  { code: '+61', label: '🇦🇺 Australia (+61)' },
  { code: '+971', label: '🇦🇪 UAE (+971)' },
  { code: '+966', label: '🇸🇦 Saudi (+966)' },
  { code: '+65', label: '🇸🇬 Singapore (+65)' },
  { code: '+49', label: '🇩🇪 Germany (+49)' },
  { code: '+33', label: '🇫🇷 France (+33)' },
  { code: '+880', label: '🇧🇩 Bangladesh (+880)' },
  { code: '+92', label: '🇵🇰 Pakistan (+92)' },
  { code: '+977', label: '🇳🇵 Nepal (+977)' },
  { code: '+94', label: '🇱🇰 Sri Lanka (+94)' },
  { code: '+86', label: '🇨🇳 China (+86)' },
  { code: '+81', label: '🇯🇵 Japan (+81)' },
  { code: '+82', label: '🇰🇷 Korea (+82)' },
  { code: '+27', label: '🇿🇦 South Africa (+27)' },
  { code: '+55', label: '🇧🇷 Brazil (+55)' },
  { code: '+52', label: '🇲🇽 Mexico (+52)' },
  { code: '+234', label: '🇳🇬 Nigeria (+234)' },
];

const matchCode = (value) => {
  if (!value || !value.startsWith('+')) return '+91';
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  return sorted.find((c) => value.startsWith(c.code))?.code || '+91';
};

const digits = (s = '') => s.replace(/[^\d]/g, '');

export default function PhoneInput({ value = '', onChange, id, label, placeholder, required, className }) {
  const code = matchCode(value);
  const rest = value.startsWith(code) ? value.slice(code.length) : digits(value);

  const emit = (nextCode, nextRest) => {
    const d = digits(nextRest);
    onChange(nextCode + d);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <select
          aria-label="Country code"
          value={code}
          onChange={(e) => emit(e.target.value, rest)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <input
          id={id}
          inputMode="tel"
          placeholder={placeholder || '9876543210'}
          required={required}
          value={rest}
          onChange={(e) => emit(code, e.target.value)}
          className={cn(
            'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
            className
          )}
        />
      </div>
    </div>
  );
}
