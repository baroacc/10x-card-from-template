import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { FlashcardDTO } from '@/types';

const flashcardFormSchema = z.object({
  front: z.string()
    .min(1, 'Front side is required')
    .max(200, 'Front side cannot exceed 200 characters'),
  back: z.string()
    .min(1, 'Back side is required')
    .max(500, 'Back side cannot exceed 500 characters'),
});

type FlashcardFormData = z.infer<typeof flashcardFormSchema>;

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FlashcardFormData) => Promise<void>;
  flashcard?: FlashcardDTO;
}

export function FlashcardModal({
  isOpen,
  onClose,
  onSubmit,
  flashcard,
}: FlashcardModalProps) {
  const form = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      front: '',
      back: '',
    },
  });

  useEffect(() => {
    if (flashcard) {
      form.reset({
        front: flashcard.front,
        back: flashcard.back,
      });
    } else {
      form.reset({
        front: '',
        back: '',
      });
    }
  }, [flashcard, form]);

  const handleSubmit = async (data: FlashcardFormData) => {
    try {
      await onSubmit(data);
      onClose();
      form.reset();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {flashcard ? 'Edit Flashcard' : 'Create New Flashcard'}
          </DialogTitle>
          <DialogDescription>
            {flashcard
              ? 'Edit the content of your flashcard. Click save when you\'re done.'
              : 'Fill in the content for your new flashcard. Click create when you\'re done.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Front Side</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the front side content..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Back Side</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the back side content..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {flashcard ? 'Save Changes' : 'Create Flashcard'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 