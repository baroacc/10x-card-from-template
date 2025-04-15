import type { Database } from './db/database.types';

/**
 * Common Types
 */

/** Valid sources for flashcards */
export type FlashcardSource = 'manual' | 'ai-full' | 'ai-edited';
type Flashcard = Database['public']['Tables']['flashcards']['Row'];
type FlashcardInsert = Database['public']['Tables']['flashcards']['Insert'];
type Generation = Database['public']['Tables']['generations']['Row'];
type GenerationErrorLog = Database['public']['Tables']['generation_error_logs']['Row'];

export type FlashcardDTO = Pick<Flashcard, 'id' | 'front' | 'back' | 'source' | 'generation_id' | 'created_at' | 'updated_at'>;

/** Generic pagination response wrapper */
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
}

export interface FlashcardListResponseDTO {
  data: FlashcardDTO[];
  pagination: PaginationDTO;
}

/** Command for creating a new flashcard */
export interface CreateFlashcardDto {
  front: string;
  back: string;
  source: FlashcardSource;
  generation_id?: number;
}

/** Command for creating multiple flashcards */
export interface CreateFlashcardsCommand {
  flashcards: CreateFlashcardDto[];
}

export type FlashcardUpdateDTO = Partial<{
  front: string;
  back: string;
  source: FlashcardSource;
  generation_id: number;
}>;

export interface GenerateFlashcardsCommand {
  source_text: string;
};

export interface FlashCardProposalDTO {
  front: string;
  back: string;
  source: "ai-full";
}

export interface CreateGenerationResponseDTO {
  generation_id: number;
  generated_count: number;
  flashcards_proposals: FlashCardProposalDTO[];
}

export type GenerationDetailDTO = Generation & {
  flashcards_proposals: FlashCardProposalDTO[];
}

export type GenerationErrorLogDTO = Pick<GenerationErrorLog, 'id' | 'ai_model' | 'error_code' | 'error_message' | 'created_at' | 'user_id' | 'source_text_hash' | 'source_text_length'>;

/** Parameters for fetching flashcards */
export interface GetFlashcardsParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
