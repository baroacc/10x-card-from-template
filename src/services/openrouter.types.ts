import { z } from 'zod';

export interface ServiceConfig {
  apiKey: string;
  apiEndpoint: string;
  defaultSystemMessage?: string;
  defaultModel?: string;
  defaultModelConfig?: Partial<ModelConfig>;
}

export interface ModelConfig {
  temperature: number;
  maxTokens: number;
  model: string;
}

export interface RequestPayload {
  messages: {
    role: 'system' | 'user';
    content: string;
  }[];
  model: string;
  temperature: number;
  max_tokens: number;
}

// Response validation schema
export const responseSchema = z.object({
  response: z.string(),
});

export type ResponseData = z.infer<typeof responseSchema>; 