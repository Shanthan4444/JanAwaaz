import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return errorResponse(res, 'Authentication token is missing. Please sign in.', 'UNAUTHENTICATED', 401);
  }

  try {
    const secret = process.env.JWT_SECRET || 'janawaaz_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.warn('[AUTH MIDDLEWARE] Token verification failed:', error.message);
    return errorResponse(res, 'Invalid or expired authentication session. Please sign in again.', 'UNAUTHENTICATED', 401);
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Authentication identity missing.', 'UNAUTHENTICATED', 401);
    }

    const rolesList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesList.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to perform this operation. Allowed roles: ${rolesList.join(', ')}`,
        'FORBIDDEN',
        403
      );
    }

    next();
  };
};
