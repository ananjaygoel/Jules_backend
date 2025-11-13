import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

let authToken = null; // Firebase token if using real auth
let mockUid = null; // For dev mode, mimic middleware mock

export function setAuth({ token, firebaseUid }) {
  authToken = token || null;
  mockUid = firebaseUid || null;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (mockUid) headers['x-mock-uid'] = mockUid; // dev-only: hit mock auth uid

  const url = `${API_URL}${path}`;
  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = (typeof data === 'object' && data?.error) ? data.error : res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // User
  register: (payload) => request('/api/user/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/api/user/me'),
  updateMe: (payload) => request('/api/user/me', { method: 'PUT', body: JSON.stringify(payload) }),
  startedSeries: () => request('/api/user/me/started-series'),
  // Feed
  home: (params = { page: 1, limit: 10 }) => request(`/api/feed?page=${params.page}&limit=${params.limit}`),
  series: (id) => request(`/api/feed/series/${id}`),
  // cache feed config to avoid refetching
  feedConfig: (() => {
    let cache = null; let inflight = null;
    return async () => {
      if (cache) return cache;
      if (inflight) return inflight;
      inflight = request(`/api/feed/config`).then((res) => { cache = res; inflight = null; return res; }).catch((e) => { inflight = null; throw e; });
      return inflight;
    };
  })(),
  episode: (id) => request(`/api/feed/episode/${id}`),
  peekEpisode: (id) => request(`/api/feed/episode/${id}/peek`),
  unlockEpisode: (id) => request(`/api/feed/episode/${id}/unlock`, { method: 'POST' }),
  search: (q, page = 1, limit = 20) => request(`/api/search?query=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),
  // Tasks
  completeProfile: () => request('/api/tasks/onetime/complete-profile', { method: 'POST' }),
  followSocial: () => request('/api/tasks/onetime/follow-social', { method: 'POST' }),
  watchAd: () => request('/api/tasks/daily/watch-ad', { method: 'POST' }),
  spinWheel: () => request('/api/tasks/ambitious/spin-wheel', { method: 'POST' }),
  claimSpin: (result) => request('/api/tasks/ambitious/claim-spin-reward', { method: 'POST', body: JSON.stringify({ result }) }),
  monthlyBonus: () => request('/api/tasks/monthly/bonus', { method: 'POST' }),
  russianRoulette: () => request('/api/tasks/ambitious/russian-roulette', { method: 'POST' }),
  claimRussianRoulette: (result) => request('/api/tasks/ambitious/claim-russian-roulette-reward', { method: 'POST', body: JSON.stringify({ result }) }),
  scratchCard: () => request('/api/tasks/ambitious/scratch-card', { method: 'POST' }),
  claimScratchCard: (potentialCoins) => request('/api/tasks/ambitious/claim-scratch-card-reward', { method: 'POST', body: JSON.stringify({ potentialCoins }) }),
  // Referral
  generateCode: () => request('/api/referral/generate-code', { method: 'POST' }),
  enterCode: (code) => request('/api/referral/enter-code', { method: 'POST', body: JSON.stringify({ code }) }),
  // Payments
  paymentConfig: () => request('/api/payment/config'),
  createPaymentIntent: ({ amountInPaise, currency = 'inr' }) => request('/api/payment/create-payment-intent', { method: 'POST', body: JSON.stringify({ amount: amountInPaise, currency }) }),
  createSubscription: ({ plan, couponCode }) => request('/api/payment/create-subscription', { method: 'POST', body: JSON.stringify({ plan, couponCode }) }),
  verifyIAP: ({ platform, productId, purchaseToken, orderId, type }) => request('/api/payment/iap/verify', { method: 'POST', body: JSON.stringify({ platform, productId, purchaseToken, orderId, type }) }),
};
