import { useState } from "react";
import type {
  CreateFlashcardsCommand,
  CreateGenerationResponseDTO,
  FlashcardProposalViewModel,
  GenerateFlashcardsCommand,
} from "../types";

export function useGenerations() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const generateFlashcards = async (text: string) => {
    if (text.length < 1000 || text.length > 10000) {
      setError("Text must be between 1000 and 10000 characters");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const command: GenerateFlashcardsCommand = {
        source_text: text,
      };

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data: CreateGenerationResponseDTO = await response.json();
      setGenerationId(data.generation_id);
      return data.flashcards_proposals.map((proposal) => ({
        ...proposal,
        accepted: false,
        edited: false,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveFlashcards = async (flashcardsToSave: FlashcardProposalViewModel[]) => {
    setIsSaving(true);
    setError(null);

    try {
      const command: CreateFlashcardsCommand = {
        flashcards: flashcardsToSave.map((proposal) => ({
          front: proposal.front,
          back: proposal.back,
          source: proposal.edited ? "ai-edited" : "ai-full",
          generation_id: generationId ?? undefined,
        })),
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards");
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred while saving");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    isSaving,
    error,
    generateFlashcards,
    saveFlashcards,
  };
}
