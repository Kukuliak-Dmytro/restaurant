import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET||'';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
    return;
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Extract user information from the token
    req.user = {
      sub: decoded.sub, // User ID from Supabase
      email: decoded.email,
      ...decoded
    };
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

export const extractUserId = (req: Request): string | null => {
  return req.user?.sub || null;
};
