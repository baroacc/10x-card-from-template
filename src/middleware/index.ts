import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from '../db/supabase.client';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/reset-password',
  '/api/auth/me',
];

export const onRequest = defineMiddleware(async ({ cookies, request, redirect, url }, next) => {
  const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

  const { data: { user } } = await supabase.auth.getUser();

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do stron auth
  if (user && PUBLIC_PATHS.includes(url.pathname)) {
    if (url.pathname !== '/api/auth/me') {
      return redirect('/generate');
    }
  }

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionych stron
  if (!user && !PUBLIC_PATHS.includes(url.pathname)) {
    return redirect('/login');
  }

  const response = await next();
  return response;
}); 