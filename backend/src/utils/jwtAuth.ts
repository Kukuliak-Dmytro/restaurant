import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabasePublishKey = process.env.PUBLISH_KEY || '';

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

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    // Create Supabase client with publish key and user's JWT token
    const supabase = createClient(supabaseUrl, supabasePublishKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Use Supabase to verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Supabase auth error:', error);
      res.status(403).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
      return;
    }
    
    // Extract user information
    req.user = {
      sub: user.id,
      email: user.email,
      ...user
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

export const extractUserId = (req: Request): string | null => {
  return req.user?.sub || null;
};
