import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateFlashcardsCommand, FlashcardListResponseDTO } from "../../types";
import { FlashcardService, type GetFlashcardsParams } from "../../services/flashcard.service";
import { createSupabaseServerClient } from "../../db/supabase.client";

// Disable prerendering for dynamic API route
export const prerender = false;

// Validation schemas
const flashcardSchema = z.object({
  front: z.string().max(200, "Front content cannot exceed 200 characters"),
  back: z.string().max(500, "Back content cannot exceed 500 characters"),
  source: z.enum(["manual", "ai-full", "ai-edited"], {
    errorMap: () => ({ message: "Invalid source value" }),
  }),
  generation_id: z.number().positive().optional(),
});

const createFlashcardsSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1, "At least one flashcard is required"),
});

const getFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["created_at", "updated_at", "front", "back"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const GET: APIRoute = async ({ url, cookies, request }) => {
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(url.searchParams);
    const validationResult = getFlashcardsQuerySchema.safeParse(searchParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const params = validationResult.data as GetFlashcardsParams;
    const supabase = createSupabaseServerClient({ headers: request.headers, cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const flashcardService = new FlashcardService(supabase);

    // Fetch flashcards
    const { data, total } = await flashcardService.getFlashcards(user.id, params);

    const response: FlashcardListResponseDTO = {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = (await request.json()) as CreateFlashcardsCommand;
    const validationResult = createFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { flashcards } = validationResult.data;
    const supabase = createSupabaseServerClient({ headers: request.headers, cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const flashcardService = new FlashcardService(supabase);

    // Create flashcards
    const createdFlashcards = await flashcardService.createFlashcards(flashcards, user.id);

    return new Response(
      JSON.stringify({
        data: createdFlashcards,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing flashcards creation:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
