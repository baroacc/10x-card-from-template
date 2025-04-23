import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../db/supabase.client';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response(
        JSON.stringify({ error: error?.message || 'User not found' }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({ 
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email
        }
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