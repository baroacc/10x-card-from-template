import type { FlashcardProposalViewModel } from '../types';
import { FlashcardItem } from './FlashcardItem';

interface FlashcardsListProps {
  proposals: FlashcardProposalViewModel[];
  onAccept: (index: number) => void;
  onEdit: (index: number, front: string, back: string) => void;
  onReject: (index: number) => void;
}

export function FlashcardsList({ proposals, onAccept, onEdit, onReject }: FlashcardsListProps) {
  if (proposals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold">Generated Flashcards ({proposals.length})</h2>
      <div className="grid gap-4">
        {proposals.map((proposal, index) => (
          <FlashcardItem
            key={index}
            proposal={proposal}
            onAccept={() => onAccept(index)}
            onEdit={(front, back) => onEdit(index, front, back)}
            onReject={() => onReject(index)}
          />
        ))}
      </div>
    </div>
  );
} 