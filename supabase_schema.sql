
-- Schema for Madrassa Data (generic storage)
CREATE TABLE madrassa_data (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(tenant_id, key)
);

-- Enable RLS
ALTER TABLE madrassa_data ENABLE ROW LEVEL SECURITY;
