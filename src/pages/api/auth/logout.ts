import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../db/supabase.client';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }

    return new Response(
      null,
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}; 