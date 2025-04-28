import type { FlashcardProposalViewModel } from '../types';
import { FlashcardItem } from './FlashcardItem';

interface FlashcardsListProps {
  proposals: FlashcardProposalViewModel[];
  onAccept: (index: number) => void;
  onEdit: (index: number, front: string, back: string) => void;
  onReject: (index: number) => void;
  'data-test-id'?: string;
}

export function FlashcardsList({ proposals, onAccept, onEdit, onReject, 'data-test-id': dataTestId }: FlashcardsListProps) {
  if (proposals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-8" data-test-id={dataTestId || "flashcards-list-container"}>
      <h2 className="text-xl font-semibold" data-test-id="flashcards-list-header">Generated Flashcards ({proposals.length})</h2>
      <div className="grid gap-4" data-test-id="flashcards-grid">
        {proposals.map((proposal, index) => (
          <FlashcardItem
            key={index}
            proposal={proposal}
            onAccept={() => onAccept(index)}
            onEdit={(front, back) => onEdit(index, front, back)}
            onReject={() => onReject(index)}
            data-test-id={`flashcard-item-${index}`}
          />
        ))}
      </div>
    </div>
  );
} 