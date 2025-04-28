import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import type { ChangeEvent } from 'react';

interface TextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  'data-test-id'?: string;
}

export function TextAreaInput({ value, onChange, 'data-test-id': dataTestId }: TextAreaInputProps) {
  const charCount = value.length;
  const isValid = charCount >= 1000 && charCount <= 10000;
  const showError = charCount > 0 && !isValid;
  const validationColor = !value.length ? 'text-gray-500' : 
    isValid ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-2">
      <Label htmlFor="source-text">Enter your text (1000-10000 characters)</Label>
      <Textarea
        id="source-text"
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder="Enter your text here..."
        className="min-h-[200px]"
        data-test-id={dataTestId || "source-text-textarea"}
      />
      <div className={`text-sm ${validationColor}`} data-test-id="character-count">
        {charCount} / 10000 characters
        {showError && (
          <span className="ml-2" data-test-id="validation-message">
            {charCount < 1000 ? `(${1000 - charCount} more needed)` : `(${charCount - 10000} too many)`}
          </span>
        )}
      </div>
    </div>
  );
} 