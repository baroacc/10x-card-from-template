import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

  // Get current user
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Delete user account
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 400,
    });
  }

  // Sign out after deletion
  await supabase.auth.signOut();

  return new Response(null, { status: 200 });
};
