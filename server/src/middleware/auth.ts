import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) {
          console.warn('[AuthMiddleware] Token verification failed:', error.message);
        } else if (user) {
          req.user = user;
          req.userId = user.id;
        }
      } catch (err) {
        console.warn('[AuthMiddleware] Unexpected token validation error:', err);
      }
    }
  }

  // Fallback to body/param userId if unauthenticated demo
  if (!req.userId) {
    req.userId = req.body?.userId || req.params?.userId || (req.query?.userId as string);
  }

  next();
};
