import type { ServiceConfig, ModelConfig, ResponseData, RequestPayload } from "./openrouter.types";
import { z } from "zod";

// OpenRouter API response schema
const openRouterResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string(),
        }),
      })
    )
    .min(1),
});

export class OpenRouterService {
  private readonly _apiKey: string;
  private readonly _apiEndpoint: string;
  private _systemMessage: string;
  private _userMessage = "";
  private _modelConfig: ModelConfig;
  private readonly _retries: number = 3;

  constructor(config: ServiceConfig) {
    if (!config.apiKey) {
      throw new Error("API key is required");
    }
    if (!config.apiEndpoint) {
      throw new Error("API endpoint is required");
    }

    this._apiKey = config.apiKey;
    this._apiEndpoint = config.apiEndpoint;
    this._systemMessage = config.defaultSystemMessage || "You are an AI assistant specialized in chatting.";
    this._modelConfig = {
      model: config.defaultModel || "gpt-4o-mini",
      temperature: config.defaultModelConfig?.temperature || 0.7,
      maxTokens: config.defaultModelConfig?.maxTokens || 150,
    };
  }

  // Public methods for configuration
  public setSystemMessage(message: string): void {
    if (!message.trim()) {
      throw new Error("System message cannot be empty");
    }
    this._systemMessage = message;
  }

  public getModelConfig(): ModelConfig {
    return { ...this._modelConfig };
  }

  public setUserMessage(message: string): void {
    if (!message.trim()) {
      throw new Error("User message cannot be empty");
    }
    this._userMessage = message;
  }

  public setModelConfig(config: Partial<ModelConfig>): void {
    this._modelConfig = {
      ...this._modelConfig,
      ...config,
    };
  }

  // Main public method for sending requests
  public async sendRequest(): Promise<ResponseData> {
    const payload = this.buildRequestPayload();
    return this.executeRequest(payload);
  }

  // Private methods
  private buildRequestPayload(): RequestPayload {
    if (!this._userMessage) {
      throw new Error("User message must be set before sending a request");
    }

    return {
      messages: [
        {
          role: "system",
          content: `${this._systemMessage}\nIMPORTANT: You must respond ONLY with a valid JSON object in the exact format: { "flashcards": [{ "front": "question", "back": "answer" }] }. Do not include any other text or explanation.`,
        },
        {
          role: "user",
          content: this._userMessage,
        },
      ],
      model: this._modelConfig.model,
      temperature: this._modelConfig.temperature,
      max_tokens: this._modelConfig.maxTokens,
    };
  }

  private configureHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this._apiKey}`,
      "HTTP-Referer": "flashcard-generator.fakedomain.com",
      "X-Title": "Flashcard Generator",
    };
  }

  private async executeRequest(payload: RequestPayload, attempt = 1): Promise<ResponseData> {
    try {
      console.log("Sending request to OpenRouter:", JSON.stringify(payload, null, 2));

      const response = await fetch(this._apiEndpoint, {
        method: "POST",
        headers: this.configureHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const rawData = await response.json();
      console.log("OpenRouter raw response:", JSON.stringify(rawData, null, 2));

      // Validate the raw response structure
      const validatedResponse = openRouterResponseSchema.parse(rawData);

      // Parse the content as JSON since it should be a JSON string
      let content;
      try {
        content = JSON.parse(validatedResponse.choices[0].message.content);
        // Validate that the content matches our expected format
        if (!content.flashcards || !Array.isArray(content.flashcards)) {
          throw new Error("Response does not contain flashcards array");
        }
        for (const card of content.flashcards) {
          if (!card.front || !card.back || typeof card.front !== "string" || typeof card.back !== "string") {
            throw new Error("Invalid flashcard format in response");
          }
        }
      } catch (error) {
        console.error("Failed to parse or validate response content:", error);
        throw new Error("Invalid response format from AI");
      }

      // Return in our expected format
      return {
        response: JSON.stringify(content),
      };
    } catch (error) {
      if (attempt < this._retries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeRequest(payload, attempt + 1);
      }
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      // Log the error details here
      console.error("OpenRouter API Error:", error);
      return error;
    }
    return new Error("An unknown error occurred");
  }
}
