import type { Database } from '../db/database.types';
import type { GenerationErrorLogDTO, PaginationDTO } from '../types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Serwis do obsługi logów błędów generacji.
 * Zawiera metody dostępu do danych z tabeli generation_error_logs.
 */
export class GenerationErrorLogsService {
  constructor(
    private readonly supabase: SupabaseClient<Database>
  ) {}

  /**
   * Pobiera listę logów błędów generacji dla danego użytkownika
   * z zastosowaniem paginacji wyników.
   * 
   * @param userId - Identyfikator użytkownika, którego logi mają zostać pobrane
   * @param page - Numer strony (zaczynając od 1)
   * @param limit - Liczba rekordów na stronę
   * @returns Obiekt zawierający dane logów i informacje o paginacji
   * @throws Error w przypadku niepowodzenia operacji bazy danych
   */
  async getGenerationErrorLogs(
    userId: string, 
    page: number, 
    limit: number
  ): Promise<{ data: GenerationErrorLogDTO[], pagination: PaginationDTO }> {
    // Obliczenie offsetu dla paginacji
    const offset = (page - 1) * limit;

    // Pobieranie danych z licznikiem wszystkich rekordów
    const { data: logs, error, count: total } = await this.supabase
      .from('generation_error_logs')
      .select('id, ai_model, error_code, error_message, created_at, user_id, source_text_hash, source_text_length', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Obsługa błędów z Supabase
    if (error) {
      console.error('Supabase error fetching generation error logs:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    // Sprawdzenie czy dane zostały pobrane
    if (!logs) {
      throw new Error('Failed to fetch generation error logs: No data returned');
    }
    
    // Sprawdzenie czy licznik został zwrócony
    if (total === null) {
      throw new Error('Failed to get total count of generation error logs');
    }

    // Konwersja danych do DTOs
    const errorLogs: GenerationErrorLogDTO[] = logs.map(log => ({
      id: log.id,
      ai_model: log.ai_model,
      error_code: log.error_code,
      error_message: log.error_message,
      created_at: log.created_at,
      user_id: log.user_id,
      source_text_hash: log.source_text_hash,
      source_text_length: log.source_text_length
    }));

    // Zwrócenie danych i informacji o paginacji
    return {
      data: errorLogs,
      pagination: {
        page,
        limit,
        total
      }
    };
  }
} 