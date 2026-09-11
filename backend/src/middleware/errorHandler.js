import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[EXPRESS ERROR] ${req.method} ${req.originalUrl}:`, err);

  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 'VALIDATION_ERROR', 400);
  }

  if (err.code === 11000) {
    return errorResponse(res, 'Duplicate resource identifier detected', 'DUPLICATE_ERROR', 409);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred';
  const code = err.code || 'INTERNAL_ERROR';

  return errorResponse(res, message, code, statusCode);
};
