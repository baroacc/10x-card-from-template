import { useState } from 'react';
import type { FlashcardProposalViewModel } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

interface FlashcardItemProps {
  proposal: FlashcardProposalViewModel;
  onAccept: () => void;
  onEdit: (front: string, back: string) => void;
  onReject: () => void;
  'data-test-id'?: string;
}

export function FlashcardItem({ proposal, onAccept, onEdit, onReject, 'data-test-id': dataTestId }: FlashcardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(proposal.front);
  const [back, setBack] = useState(proposal.back);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    if (front.length > 200) {
      setError('Front side must be less than 200 characters');
      return;
    }
    if (back.length > 500) {
      setError('Back side must be less than 500 characters');
      return;
    }

    onEdit(front, back);
    setIsEditing(false);
    setError(null);
  };

  const handleCancelEdit = () => {
    setFront(proposal.front);
    setBack(proposal.back);
    setIsEditing(false);
    setError(null);
  };

  return (
    <Card className={proposal.accepted ? 'border-green-500' : ''} data-test-id={dataTestId || "flashcard-item"}>
      <CardContent className="pt-6">
        {isEditing ? (
          <div className="space-y-4" data-test-id="edit-mode-container">
            <div>
              <Label htmlFor="front">Front (max 200 characters)</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="mt-1"
                placeholder="Front side of the flashcard"
                data-test-id="front-edit-textarea"
              />
              <div className="text-sm text-gray-500 mt-1" data-test-id="front-char-count">
                {front.length}/200 characters
              </div>
            </div>
            <div>
              <Label htmlFor="back">Back (max 500 characters)</Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="mt-1"
                placeholder="Back side of the flashcard"
                data-test-id="back-edit-textarea"
              />
              <div className="text-sm text-gray-500 mt-1" data-test-id="back-char-count">
                {back.length}/500 characters
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600" data-test-id="edit-error-message">{error}</div>
            )}
          </div>
        ) : (
          <div className="space-y-4" data-test-id="view-mode-container">
            <div>
              <Label>Front</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md" data-test-id="front-content">{proposal.front}</div>
            </div>
            <div>
              <Label>Back</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md" data-test-id="back-content">{proposal.back}</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-2">
          {proposal.edited && <Badge variant="outline" data-test-id="edited-badge">Edited</Badge>}
          {proposal.accepted && <Badge variant="outline" className="border-green-500 text-green-700" data-test-id="accepted-badge">Accepted</Badge>}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit} data-test-id="cancel-edit-button">Cancel</Button>
              <Button onClick={handleEdit} data-test-id="save-edit-button">Save</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)} data-test-id="edit-button">Edit</Button>
              <Button variant="outline" onClick={onReject} className="text-red-600 hover:text-red-700" data-test-id="reject-button">Reject</Button>
              <Button onClick={onAccept} className="bg-green-600 hover:bg-green-700" data-test-id="accept-button">Accept</Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 