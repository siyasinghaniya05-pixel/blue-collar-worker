import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'kaushalid-secure-jwt-secret-key-2026';

/**
 * Middleware: Verifies JWT bearer token from Authorization header.
 * Attaches decoded user payload ({ id, email, role, name, kaushalId }) to req.user.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Please provide a valid Bearer token.',
      code: 'AUTH_REQUIRED'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      const message = err.name === 'TokenExpiredError' 
        ? 'Session has expired. Please log in again.' 
        : 'Invalid or forged token.';
      return res.status(403).json({
        error: message,
        code: 'TOKEN_INVALID'
      });
    }

    req.user = decoded;
    next();
  });
}

/**
 * Middleware: Checks if authenticated user has one of the required roles.
 * Must be preceded by authenticateToken.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required before role verification.',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: This resource requires one of [${allowedRoles.join(', ')}] role(s). Your current role is '${req.user.role}'.`,
        code: 'FORBIDDEN_ROLE'
      });
    }

    next();
  };
}

/**
 * Middleware: Optional token decoder. Populates req.user if a valid token is present,
 * but allows unauthenticated requests to proceed.
 */
export function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
    } else {
      req.user = null;
    }
    next();
  });
}
