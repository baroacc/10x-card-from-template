import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateFlashcardDto, FlashcardDTO, FlashcardUpdateDTO } from '../types';
import type { Database } from '../db/database.types';

export interface GetFlashcardsParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Creates multiple flashcards for a given user
   * @param flashcards - Array of flashcard data to create
   * @param userId - ID of the user creating the flashcards
   * @returns Promise resolving to array of created flashcards
   * @throws Error if flashcard creation fails
   */
  async createFlashcards(flashcards: CreateFlashcardDto[], userId: string): Promise<FlashcardDTO[]> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .insert(
        flashcards.map(flashcard => ({
          ...flashcard,
          user_id: userId
        }))
      )
      .select();

    if (error) {
      console.error('Error creating flashcards:', error);
      throw new Error('Failed to create flashcards');
    }

    return data as FlashcardDTO[];
  }

  /**
   * Retrieves paginated flashcards for a given user with optional filtering and sorting
   * @param userId - ID of the user to fetch flashcards for
   * @param params - Parameters for pagination, filtering and sorting
   * @returns Promise resolving to object containing flashcards data and total count
   * @throws Error if fetching flashcards fails
   */
  async getFlashcards(userId: string, params: GetFlashcardsParams): Promise<{ data: FlashcardDTO[], total: number }> {
    const { page, limit, search, sortBy = 'created_at', order = 'desc' } = params;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('flashcards')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', true);

    // Apply search filter if provided
    if (search) {
      query = query.or(`front.ilike.%${search}%,back.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching flashcards:', error);
      throw new Error('Failed to fetch flashcards');
    }

    return {
      data: data as FlashcardDTO[],
      total: count ?? 0
    };
  }

  /**
   * Updates an existing flashcard
   * @param flashcardId - ID of the flashcard to update
   * @param userId - ID of the user who owns the flashcard
   * @param updateData - Data to update the flashcard with
   * @returns Promise resolving to the updated flashcard
   * @throws Error if flashcard update fails or flashcard not found
   */
  async updateFlashcard(flashcardId: number, userId: string, updateData: FlashcardUpdateDTO): Promise<FlashcardDTO> {
    // First check if the flashcard exists and belongs to the user
    const { data: existingFlashcard, error: findError } = await this.supabase
      .from('flashcards')
      .select()
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .single();

    if (findError || !existingFlashcard) {
      throw new Error('Flashcard not found');
    }

    // Update the flashcard
    const { data, error } = await this.supabase
      .from('flashcards')
      .update(updateData)
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating flashcard:', error);
      throw new Error('Failed to update flashcard');
    }

    return data as FlashcardDTO;
  }

  /**
   * Soft deletes a flashcard by setting its status to false
   * @param flashcardId - ID of the flashcard to delete
   * @param userId - ID of the user who owns the flashcard
   * @returns Promise resolving to void
   * @throws Error if flashcard deletion fails
   */
  async deleteFlashcard(flashcardId: number, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('flashcards')
      .update({ status: false })
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .eq('status', true);

    if (error) {
      console.error('Error deleting flashcard:', error);
      throw new Error('Failed to delete flashcard');
    }
  }

  /**
   * Retrieves a single flashcard by ID
   * @param flashcardId - ID of the flashcard to retrieve
   * @param userId - ID of the user who owns the flashcard
   * @returns Promise resolving to the flashcard data
   * @throws Error if flashcard not found or retrieval fails
   */
  async getFlashcard(flashcardId: number, userId: string): Promise<FlashcardDTO> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .select('id, front, back, source, generation_id, created_at, updated_at, status')
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching flashcard:', error);
      throw new Error('Failed to fetch flashcard');
    }

    if (!data) {
      throw new Error('Flashcard not found');
    }

    return data as FlashcardDTO;
  }
} 