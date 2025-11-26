const RESET_TOKEN_EXPIRY = 15 * 60 * 1000;
const STORAGE_KEY = 'kitadihub_reset_tokens';

const readStore = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
};

const writeStore = (list) => {
    localStorage.getItem(STORAGE_KEY, JSON.stringify(list));
};

const genToken = () => {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const createResetToken = (email) => {
  const token = genToken();
  const expiresAt = Date.now() + RESET_TOKEN_TTL;
  const tokens = readStore();
  tokens.push({ token, email, expiresAt });
  writeStore(tokens);
  return token;
};

export const verifyResetToken = (token) => {
  const tokens = readStore();
  const found = tokens.find(t => t.token === token);
  if (!found) return { valid: false, reason: 'Token inválido' };
  if (found.expiresAt < Date.now()) return { valid: false, reason: 'Token expirado' };
  return { valid: true, email: found.email };
};

export const consumeResetToken = (token) => {
  const tokens = readStore();
  const idx = tokens.findIndex(t => t.token === token);
  if (idx === -1) return null;
  const [found] = tokens.splice(idx, 1);
  writeStore(tokens);
  return found.email;
};