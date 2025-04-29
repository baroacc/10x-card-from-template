import type { FlashcardProposalViewModel } from '../types';
import { Button } from './ui/button';

interface BulkSaveButtonProps {
  proposals: FlashcardProposalViewModel[];
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  isSaving: boolean;
  'data-testid'?: string;
}

export function BulkSaveButton({ proposals, onSaveAll, onSaveAccepted, isSaving, 'data-testid': dataTestId }: BulkSaveButtonProps) {
  const acceptedCount = proposals.filter(p => p.accepted).length;
  const hasProposals = proposals.length > 0;
  const hasAccepted = acceptedCount > 0;

  if (!hasProposals) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 mt-6" data-testid={dataTestId || "bulk-save-container"}>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onSaveAll}
          disabled={isSaving || !hasProposals}
          data-testid="save-all-button"
        >
          {isSaving ? 'Saving...' : `Save All (${proposals.length})`}
        </Button>
        <Button
          onClick={onSaveAccepted}
          disabled={isSaving || !hasAccepted}
          className="bg-green-600 hover:bg-green-700"
          data-testid="save-accepted-button"
        >
          {isSaving ? 'Saving...' : `Save Accepted (${acceptedCount})`}
        </Button>
      </div>
    </div>
  );
} 