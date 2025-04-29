import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

interface TextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  'data-testid'?: string;
}

export function TextAreaInput({ value, onChange, 'data-testid': dataTestId }: TextAreaInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Synchronize local state with props
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Apply debouncing to onChange handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  const charCount = localValue.length;
  const isValid = charCount >= 1000 && charCount <= 10000;
  const showError = charCount > 0 && !isValid;
  const validationColor = !localValue.length ? 'text-gray-500' : 
    isValid ? 'text-green-600' : 'text-red-600';

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="source-text">Enter your text (1000-10000 characters)</Label>
      <Textarea
        id="source-text"
        value={localValue}
        onChange={handleChange}
        placeholder="Enter your text here..."
        className="min-h-[200px]"
        data-testid={dataTestId}
      />
      <div className={`text-sm ${validationColor}`} data-testid="character-count">
        {charCount} / 10000 characters
        {showError && (
          <span className="ml-2" data-testid="validation-message">
            {charCount < 1000 ? `(${1000 - charCount} more needed)` : `(${charCount - 10000} too many)`}
          </span>
        )}
      </div>
    </div>
  );
} 