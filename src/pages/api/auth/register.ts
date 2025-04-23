import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../db/supabase.client';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    // Rejestracja użytkownika
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Mapowanie błędów Supabase na przyjazne komunikaty
      let errorMessage = 'Registration failed';
      
      if (error.message.includes('email already registered')) {
        errorMessage = 'This email is already registered';
      } else if (error.message.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (error.message.includes('password')) {
        errorMessage = 'Password must be at least 8 characters long and contain at least one number';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400 }
      );
    }

    // Wylogowujemy użytkownika, aby musiał się zalogować ręcznie
    await supabase.auth.signOut();

    // Czyścimy wszystkie ciasteczka związane z sesją
    const cookieNames = ['sb-access-token', 'sb-refresh-token'];
    cookieNames.forEach(name => {
      cookies.delete(name, { path: '/' });
    });

    return new Response(
      JSON.stringify({ 
        user: data.user,
        message: 'Registration successful! Please sign in to your account.'
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}; 