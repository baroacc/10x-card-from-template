CREATE TABLE generations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    ai_model VARCHAR NOT NULL,
    generated_count INTEGER NOT NULL,
    accepted_unedited_count INTEGER,
    accepted_edited_count INTEGER NOT NULL,
    source_text_hash VARCHAR NOT NULL,
    source_text_length INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000),
    generation_duration INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE flashcards (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    front VARCHAR(200) NOT NULL CHECK (char_length(front) <= 200),
    back VARCHAR(500) NOT NULL CHECK (char_length(back) <= 500),
    source VARCHAR(20) NOT NULL CHECK (source in ('ai-full', 'ai-edited', 'manual')),
    status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generation_id INTEGER REFERENCES generations(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id)
);

CREATE TABLE generation_error_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    ai_model VARCHAR NOT NULL,
    source_text_hash TEXT NOT NULL,
    source_text_length INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000),
    error_code TEXT NOT NULL,
    error_message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flashcards_user_id ON flashcards (user_id);
CREATE INDEX idx_generations_user_id ON generations (user_id);
CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs (user_id);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_flashcards_policy ON flashcards
FOR ALL
USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flashcards_updated_at
BEFORE UPDATE ON flashcards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();