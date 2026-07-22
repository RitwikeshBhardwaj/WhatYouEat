export const cn = (...parts) => parts.filter(Boolean).join(' ');

export const formatDate = (d) => new Date(d).toISOString().slice(0, 10);

export const prettyDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export const round = (n, d = 1) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

export const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
