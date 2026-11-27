const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'copc-rms-dev-secret';

function createToken(payload) {
  const data = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function attachUserIfPresent(req, res, next) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    const decoded = verifyToken(auth.slice(7).trim());
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}

module.exports = { createToken, verifyToken, attachUserIfPresent };
