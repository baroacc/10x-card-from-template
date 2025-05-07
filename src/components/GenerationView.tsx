import { useState, useEffect } from "react";
import type { FlashcardProposalViewModel } from "../types";
import { useGenerations } from "../hooks/useGenerations";
import { TextAreaInput } from "./TextAreaInput";
import { FlashcardsList } from "./FlashcardsList";
import { BulkSaveButton } from "./BulkSaveButton";
import { SkeletonLoader } from "./SkeletonLoader";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function GenerationView() {
  const [textInput, setTextInput] = useState("");
  const [proposals, setProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isLoading, isSaving, error, generateFlashcards, saveFlashcards } = useGenerations();

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleGenerate = async () => {
    const generatedProposals = await generateFlashcards(textInput);
    if (generatedProposals) {
      setProposals(generatedProposals);
    }
  };

  const handleAccept = (index: number) => {
    setProposals(proposals.map((proposal, i) => (i === index ? { ...proposal, accepted: true } : proposal)));
  };

  const handleEdit = (index: number, front: string, back: string) => {
    setProposals(proposals.map((proposal, i) => (i === index ? { ...proposal, front, back, edited: true } : proposal)));
  };

  const handleReject = (index: number) => {
    setProposals(proposals.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    const success = await saveFlashcards(proposals);
    if (success) {
      setProposals([]);
      setShowSuccess(true);
      setTextInput("");
    }
  };

  const handleSaveAccepted = async () => {
    const acceptedProposals = proposals.filter((p) => p.accepted);
    const success = await saveFlashcards(acceptedProposals);
    if (success) {
      setProposals(proposals.filter((p) => !p.accepted));
      setShowSuccess(true);
      if (proposals.length === acceptedProposals.length) {
        setTextInput("");
      }
    }
  };

  return (
    <div className="container mx-auto py-8" data-testid="flashcard-generation-view">
      <Card data-testid="generation-card">
        <CardHeader>
          <CardTitle>Generate Flashcards</CardTitle>
        </CardHeader>
        <CardContent>
          <TextAreaInput value={textInput} onChange={setTextInput} data-testid="source-text-input" />
          <div className="mt-4">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || textInput.length < 1000 || textInput.length > 10000}
              data-testid="generate-flashcards-button"
            >
              {isLoading ? "Generating..." : "Generate Flashcards"}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md" data-testid="error-message">
              {error}
            </div>
          )}
          {showSuccess && !isSaving && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md" data-testid="success-message">
              Flashcards have been successfully saved!
            </div>
          )}
          {isLoading ? (
            <SkeletonLoader data-testid="loading-skeleton" />
          ) : (
            <>
              <FlashcardsList
                proposals={proposals}
                onAccept={handleAccept}
                onEdit={handleEdit}
                onReject={handleReject}
                data-testid="flashcards-list"
              />
              <BulkSaveButton
                proposals={proposals}
                onSaveAll={handleSaveAll}
                onSaveAccepted={handleSaveAccepted}
                isSaving={isSaving}
                data-testid="bulk-save-buttons"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
