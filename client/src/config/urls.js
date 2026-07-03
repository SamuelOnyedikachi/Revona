const PRODUCTION_API_URL = 'https://revora-server-production.up.railway.app/api';
const PRODUCTION_SOCKET_URL = 'https://revora-server-production.up.railway.app';

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_URL =
  process.env.REACT_APP_API_URL || (isLocalhost ? '/api' : PRODUCTION_API_URL);

export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || (isLocalhost ? 'http://localhost:5000' : PRODUCTION_SOCKET_URL);
