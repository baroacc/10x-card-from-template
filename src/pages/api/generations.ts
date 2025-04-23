import { z } from 'zod';
import type { APIRoute } from 'astro';
import type { GenerateFlashcardsCommand, GenerationDetailDTO, PaginationDTO } from '../../types';
import { GenerationsService } from '../../services/generations.service';
import { createSupabaseServerClient } from '../../db/supabase.client';

// Input validation schemas
const generateFlashcardsSchema = z.object({
  source_text: z.string()
    .min(1000, 'Text must be at least 1000 characters long')
    .max(10000, 'Text cannot exceed 10000 characters')
}) satisfies z.ZodType<GenerateFlashcardsCommand>;

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json() as GenerateFlashcardsCommand;
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validationResult.error.errors
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
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

    const generationsService = new GenerationsService(supabase);
    const result = await generationsService.createGeneration(validationResult.data, user.id);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing generation request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const GET: APIRoute = async ({ url, locals, cookies, request }) => {
  try {
    const searchParams = Object.fromEntries(url.searchParams);
    const validationResult = paginationSchema.safeParse(searchParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validationResult.error.errors
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { page, limit } = validationResult.data;
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

    const generationsService = new GenerationsService(supabase);
    const result = await generationsService.getGenerations(user.id, page, limit);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching generations:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 