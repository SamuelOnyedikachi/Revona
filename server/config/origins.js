const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'https://revora-client-production.up.railway.app',
];

const getAllowedOrigins = () => {
  const envOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URLS]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ORIGINS, ...envOrigins])];
};

module.exports = { getAllowedOrigins };
