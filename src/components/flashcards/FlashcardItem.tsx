import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  AlertDialog as AlertDialogRoot,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import type { FlashcardDTO } from "@/types";

interface FlashcardItemProps {
  flashcard: FlashcardDTO;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (id: number) => void;
  "data-testid"?: string;
}

export function FlashcardItem({ flashcard, onEdit, onDelete, "data-testid": dataTestId }: FlashcardItemProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card data-testid={dataTestId}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground" data-testid="flashcard-date">
              Created: {formatDate(flashcard.created_at)}
              {flashcard.updated_at !== flashcard.created_at && ` • Updated: ${formatDate(flashcard.updated_at)}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(flashcard)}
              className="h-8 w-8"
              data-testid="edit-flashcard-button"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit flashcard</span>
            </Button>
            <AlertDialogRoot>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  data-testid="delete-flashcard-button"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete flashcard</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-testid="delete-confirmation-dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this flashcard? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="cancel-delete-button">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(flashcard.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="confirm-delete-button"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogRoot>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Front</h3>
          <p className="text-base" data-testid="flashcard-front">
            {flashcard.front}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Back</h3>
          <p className="text-base" data-testid="flashcard-back">
            {flashcard.back}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground" data-testid="flashcard-source">
          Source: {flashcard.source}
          {flashcard.generation_id && ` • Generation ID: ${flashcard.generation_id}`}
        </p>
      </CardFooter>
    </Card>
  );
}
