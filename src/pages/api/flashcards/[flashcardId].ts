import type { APIRoute } from 'astro';
import { z } from 'zod';
import { FlashcardService } from '../../../services/flashcard.service';
import { createSupabaseServerClient } from '../../../db/supabase.client';
import type { FlashcardDTO } from '../../../types';

// Disable prerendering for dynamic API route
export const prerender = false;

// Validation schema for update
const updateFlashcardSchema = z.object({
  front: z.string().max(200, 'Front content cannot exceed 200 characters').optional(),
  back: z.string().max(500, 'Back content cannot exceed 500 characters').optional(),
  source: z.enum(['manual', 'ai-edited'], {
    errorMap: () => ({ message: 'Invalid source value' })
  }).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const PUT: APIRoute = async ({ params, request, locals, cookies }) => {
  try {
    if (!params.flashcardId) {
      return new Response(JSON.stringify({
        error: 'Flashcard ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const flashcardId = parseInt(params.flashcardId);
    if (isNaN(flashcardId)) {
      return new Response(JSON.stringify({
        error: 'Invalid flashcard ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createSupabaseServerClient({ headers: request.headers, cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const flashcardService = new FlashcardService(supabase);

    try {
      const updatedFlashcard = await flashcardService.updateFlashcard(
        flashcardId,
        user.id,
        validationResult.data
      );

      return new Response(JSON.stringify({ data: updatedFlashcard }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Flashcard not found') {
        return new Response(JSON.stringify({
          error: 'Flashcard not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const DELETE: APIRoute = async ({ params, locals, cookies, request }) => {
  try {
    if (!params.flashcardId) {
      return new Response(JSON.stringify({
        error: 'Flashcard ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const flashcardId = parseInt(params.flashcardId);
    if (isNaN(flashcardId)) {
      return new Response(JSON.stringify({
        error: 'Invalid flashcard ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createSupabaseServerClient({ headers: request.headers, cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const flashcardService = new FlashcardService(supabase);

    try {
      await flashcardService.deleteFlashcard(flashcardId, user.id);

      return new Response(JSON.stringify({ 
        message: 'Flashcard deleted successfully' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Flashcard not found') {
        return new Response(JSON.stringify({
          error: 'Flashcard not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Schema for validating the flashcardId parameter
const paramsSchema = z.object({
  flashcardId: z.string().regex(/^\d+$/).transform(Number),
});

export const GET: APIRoute = async ({ params, locals, cookies, request }) => {
  try {
    // Validate flashcardId parameter
    const result = paramsSchema.safeParse(params);
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: result.error.errors
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { flashcardId } = result.data;
    const supabase = createSupabaseServerClient({ headers: request.headers, cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const flashcardService = new FlashcardService(supabase);

    try {
      const flashcard = await flashcardService.getFlashcard(flashcardId, user.id);

      return new Response(
        JSON.stringify(flashcard), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'Flashcard not found') {
        return new Response(
          JSON.stringify({ error: 'Flashcard not found' }), 
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}; 