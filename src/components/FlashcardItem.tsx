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
}

export function FlashcardItem({ proposal, onAccept, onEdit, onReject }: FlashcardItemProps) {
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
    <Card className={proposal.accepted ? 'border-green-500' : ''}>
      <CardContent className="pt-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="front">Front (max 200 characters)</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="mt-1"
                placeholder="Front side of the flashcard"
              />
              <div className="text-sm text-gray-500 mt-1">
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
              />
              <div className="text-sm text-gray-500 mt-1">
                {back.length}/500 characters
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Front</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">{proposal.front}</div>
            </div>
            <div>
              <Label>Back</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">{proposal.back}</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-2">
          {proposal.edited && <Badge variant="outline">Edited</Badge>}
          {proposal.accepted && <Badge variant="outline" className="border-green-500 text-green-700">Accepted</Badge>}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              <Button onClick={handleEdit}>Save</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
              <Button variant="outline" onClick={onReject} className="text-red-600 hover:text-red-700">Reject</Button>
              <Button onClick={onAccept} className="bg-green-600 hover:bg-green-700">Accept</Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 