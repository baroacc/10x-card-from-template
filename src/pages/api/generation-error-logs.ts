import { z } from 'zod';
import type { APIRoute } from 'astro';
import type { GenerationErrorLogDTO, PaginationDTO } from '../../types';
import { GenerationErrorLogsService } from '../../services/generation-error-logs.service';
import { DEFAULT_USER_ID, createSupabaseServerClient } from '../../db/supabase.client';

/**
 * Schemat walidacji parametrów zapytania dla paginacji
 * - page: opcjonalny, liczba całkowita dodatnia, domyślnie 1
 * - limit: opcjonalny, liczba całkowita w zakresie 1-100, domyślnie 10
 */
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

export const prerender = false;

/**
 * Endpoint API zwracający listę logów błędów generacji
 * 
 * @route GET /api/generation-error-logs
 * @query page - Numer strony (opcjonalny, domyślnie 1)
 * @query limit - Liczba wyników na stronę (opcjonalny, domyślnie 10, max 100)
 * @returns {Object} - Obiekt zawierający dane i informacje o paginacji
 * @returns {GenerationErrorLogDTO[]} data - Lista logów błędów generacji
 * @returns {PaginationDTO} pagination - Informacje o paginacji (page, limit, total)
 */
export const GET: APIRoute = async ({ url, locals, cookies, request }) => {
  try {
    // Parsowanie i walidacja parametrów zapytania
    const searchParams = Object.fromEntries(url.searchParams);
    const validationResult = paginationSchema.safeParse(searchParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validationResult.error.format()
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { page, limit } = validationResult.data;
    const supabase = createSupabaseServerClient({ headers: request.headers, cookies });
    const generationErrorLogsService = new GenerationErrorLogsService(supabase);
    
    try {
      const result = await generationErrorLogsService.getGenerationErrorLogs(DEFAULT_USER_ID, page, limit);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (serviceError) {
      console.error('Service error fetching generation error logs:', serviceError);
      
      return new Response(
        JSON.stringify({ 
          error: 'Error fetching data', 
          details: serviceError instanceof Error ? serviceError.message : 'Unknown service error' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error in generation error logs endpoint:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 