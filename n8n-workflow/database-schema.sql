-- PDF History Table Schema
-- For Supabase / PostgreSQL (if using instead of SQLite/Prisma)

CREATE TABLE IF NOT EXISTS pdf_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  file_name TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  template TEXT DEFAULT 'Simple',
  font TEXT DEFAULT 'Arial',
  page_size TEXT DEFAULT 'A4',
  orientation TEXT DEFAULT 'portrait',
  page_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#000000',
  text_length INTEGER DEFAULT 0,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by email
CREATE INDEX IF NOT EXISTS idx_pdf_history_email ON pdf_history(user_email);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_pdf_history_created ON pdf_history(created_at DESC);
