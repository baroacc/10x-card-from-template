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

export const onRequest = defineMiddleware(async ({ cookies, request, redirect, url, locals }, next) => {
  const supabase = createSupabaseServerClient({ cookies, headers: request.headers });
  const { data: { user } } = await supabase.auth.getUser();

  // Add user to locals if authenticated
  if (user) {
    locals.user = user;
  }

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do stron auth
  if (user && PUBLIC_PATHS.includes(url.pathname)) {
    if (url.pathname !== '/api/auth/me') {
      return redirect('/generate');
    }
  }

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej strony
  if (!user && !PUBLIC_PATHS.includes(url.pathname)) {
    return redirect('/login');
  }

  // Continue with the request if no redirects were triggered
  return next();
}); 