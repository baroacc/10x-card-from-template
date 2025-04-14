import { z } from 'zod';
import type { APIRoute } from 'astro';
import type { GenerateFlashcardsCommand } from '../../types';
import { GenerationsService } from '../../services/generations.service';
import { DEFAULT_USER_ID, supabaseClient } from '../../db/supabase.client';

// Input validation schema
const generateFlashcardsSchema = z.object({
  source_text: z.string()
    .min(1000, 'Text must be at least 1000 characters long')
    .max(10000, 'Text cannot exceed 10000 characters')
}) satisfies z.ZodType<GenerateFlashcardsCommand>;

export const POST: APIRoute = async ({ request, locals }) => {
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
    
    const generationsService = new GenerationsService(supabaseClient);
    const result = await generationsService.createGeneration(validationResult.data, DEFAULT_USER_ID);

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