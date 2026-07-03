export const getApiErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status) return `${fallback} Server returned ${error.response.status}.`;
  if (error.request) return `${fallback} Could not reach the API server.`;
  return error.message || fallback;
};
