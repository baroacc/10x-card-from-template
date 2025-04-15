import type { Database } from '../db/database.types';
import type { CreateGenerationResponseDTO, FlashCardProposalDTO, GenerateFlashcardsCommand, GenerationDetailDTO, PaginationDTO } from '../types';
import type { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export class GenerationsService {
  constructor(
    private readonly supabase: SupabaseClient<Database>
  ) {}

  async createGeneration(command: GenerateFlashcardsCommand, userId: string): Promise<CreateGenerationResponseDTO> {
    const startTime = Date.now();
    const sourceTextHash = this.generateHash(command.source_text);

    try {
      // Mock AI generated flashcards
      const mockProposals: FlashCardProposalDTO[] = [
        {
          front: "What is the capital of France?",
          back: "Paris is the capital of France, known for its iconic Eiffel Tower and rich cultural heritage.",
          source: "ai-full"
        },
        {
          front: "Who wrote 'Romeo and Juliet'?",
          back: "William Shakespeare wrote 'Romeo and Juliet', a tragic love story that was first published in 1597.",
          source: "ai-full"
        },
        {
          front: "What is photosynthesis?",
          back: "Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen.",
          source: "ai-full"
        }
      ];

      const generationDuration = Date.now() - startTime;
      const generatedCount = mockProposals.length;

      const generation = await this.insertGeneration({
        userId,
        sourceTextHash,
        sourceTextLength: command.source_text.length,
        generationDuration,
        generatedCount
      });

      return {
        generation_id: generation.id,
        generated_count: generatedCount,
        flashcards_proposals: mockProposals
      };
    } catch (error) {
      await this.logGenerationError({
        userId,
        sourceTextHash,
        sourceTextLength: command.source_text.length,
        error
      });
      throw error;
    }
  }

  private async insertGeneration({
    userId,
    sourceTextHash,
    sourceTextLength,
    generationDuration,
    generatedCount
  }: {
    userId: string;
    sourceTextHash: string;
    sourceTextLength: number;
    generationDuration: number;
    generatedCount: number;
  }) {
    const { data: generation, error: generationError } = await this.supabase
      .from('generations')
      .insert({
        user_id: userId,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        ai_model: 'gpt-4',
        accepted_edited_count: 0,
        accepted_unedited_count: 0,
        generated_count: generatedCount,
        generation_duration: generationDuration
      })
      .select()
      .single();

    if (generationError) throw generationError;
    if (!generation) throw new Error('Failed to create generation record');

    return generation;
  }

  private async logGenerationError({
    userId,
    sourceTextHash,
    sourceTextLength,
    error
  }: {
    userId: string;
    sourceTextHash: string;
    sourceTextLength: number;
    error: unknown;
  }) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error instanceof Error ? error.name : 'UnknownError';

    const { error: logError } = await this.supabase
      .from('generation_error_logs')
      .insert({
        user_id: userId,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        ai_model: 'gpt-4',
        error_code: errorCode,
        error_message: errorMessage
      });

    if (logError) {
      console.error('Failed to log generation error:', logError);
    }
  }

  private generateHash(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  async getGenerations(userId: string, page: number, limit: number): Promise<{ data: GenerationDetailDTO[], pagination: PaginationDTO }> {
    const offset = (page - 1) * limit;

    // Get data with count
    const { data: generations, error, count: total } = await this.supabase
      .from('generations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!generations) throw new Error('Failed to fetch generations');
    if (total === null) throw new Error('Failed to get total count of generations');

    const generationsWithProposals: GenerationDetailDTO[] = generations.map(gen => ({
      ...gen,
      flashcards_proposals: []
    }));

    return {
      data: generationsWithProposals,
      pagination: {
        page,
        limit,
        total
      }
    };
  }
} 