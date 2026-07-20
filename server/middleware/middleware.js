import jwt from 'jsonwebtoken';

// --- Auth Middleware: Validates JWT token on every protected route ---
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_smart_park_key_123!@#';
    const decoded = jwt.verify(token, secret);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// --- Role Middleware: Restricts access to specific roles (must run after authMiddleware) ---
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No active session' });
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: `Forbidden: Access restricted. Required role: [${allowedRoles.join(', ')}]. Your role: ${role}`
      });
    }

    next();
  };
}
