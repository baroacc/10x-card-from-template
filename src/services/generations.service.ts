import type { Database } from '../db/database.types';
import type { CreateGenerationResponseDTO, FlashCardProposalDTO, GenerateFlashcardsCommand, GenerationDetailDTO, PaginationDTO } from '../types';
import type { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { OpenRouterService } from './openrouter.service';
import { z } from 'zod';

// Schema for validating OpenRouter response
const flashcardsResponseSchema = z.object({
  flashcards: z.array(z.object({
    front: z.string(),
    back: z.string()
  }))
});

export class GenerationsService {
  private readonly openRouter: OpenRouterService;

  constructor(
    private readonly supabase: SupabaseClient<Database>
  ) {
    if (!import.meta.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }

    this.openRouter = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    });

    // Configure OpenRouter for flashcard generation
    this.openRouter.setSystemMessage(
      `You are an AI assistant specialized in creating flashcards from provided text. 
      Create concise, clear, and educational flashcards. Each flashcard should have a question on the front 
      and a comprehensive answer on the back. Focus on key concepts and important details.
      Respond with a JSON object containing an array of flashcards in the format:
      { "flashcards": [{ "front": "question", "back": "answer" }] }`
    );

    this.openRouter.setModelConfig({
      temperature: 0.7,
      maxTokens: 2000, // Increased for longer responses with multiple flashcards
    });
  }

  async createGeneration(command: GenerateFlashcardsCommand, userId: string): Promise<CreateGenerationResponseDTO> {
    const startTime = Date.now();
    const sourceTextHash = this.generateHash(command.source_text);

    try {
      // Set the user's text as input for flashcard generation
      this.openRouter.setUserMessage(command.source_text);

      // Get response from OpenRouter
      const response = await this.openRouter.sendRequest();
      
      // Parse and validate the response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response.response);
        parsedResponse = flashcardsResponseSchema.parse(parsedResponse);
      } catch (error) {
        throw new Error('Failed to parse AI response into valid flashcards format');
      }

      // Convert the response to FlashCardProposalDTO format
      const flashcardsProposals: FlashCardProposalDTO[] = parsedResponse.flashcards.map(card => ({
        front: card.front,
        back: card.back,
        source: 'ai-full'
      }));

      const generationDuration = Date.now() - startTime;
      const generatedCount = flashcardsProposals.length;

      const generation = await this.insertGeneration({
        userId,
        sourceTextHash,
        sourceTextLength: command.source_text.length,
        generationDuration,
        generatedCount,
        aiModel: this.openRouter.getModelConfig().model
      });

      return {
        generation_id: generation.id,
        generated_count: generatedCount,
        flashcards_proposals: flashcardsProposals
      };
    } catch (error) {
      await this.logGenerationError({
        userId,
        sourceTextHash,
        sourceTextLength: command.source_text.length,
        error,
        aiModel: this.openRouter.getModelConfig().model
      });
      throw error;
    }
  }

  private async insertGeneration({
    userId,
    sourceTextHash,
    sourceTextLength,
    generationDuration,
    generatedCount,
    aiModel
  }: {
    userId: string;
    sourceTextHash: string;
    sourceTextLength: number;
    generationDuration: number;
    generatedCount: number;
    aiModel: string;
  }) {
    const { data: generation, error: generationError } = await this.supabase
      .from('generations')
      .insert({
        user_id: userId,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        ai_model: aiModel,
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
    error,
    aiModel
  }: {
    userId: string;
    sourceTextHash: string;
    sourceTextLength: number;
    error: unknown;
    aiModel: string;
  }) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error instanceof Error ? error.name : 'UnknownError';

    const { error: logError } = await this.supabase
      .from('generation_error_logs')
      .insert({
        user_id: userId,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        ai_model: aiModel,
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