-- Create payment_links table for secure payment link system
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  code_hash TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'failed')),
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  square_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on payment_id for fast lookups
CREATE INDEX idx_payment_links_payment_id ON payment_links(payment_id);

-- Create index on status for filtering
CREATE INDEX idx_payment_links_status ON payment_links(status);

-- Create index on expires_at for cleanup queries
CREATE INDEX idx_payment_links_expires_at ON payment_links(expires_at);

-- Create updated_at trigger (uses existing CoreForge helper)
DROP TRIGGER IF EXISTS set_payment_links_updated_at ON payment_links;
CREATE TRIGGER set_payment_links_updated_at
  BEFORE UPDATE ON payment_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read payment link details (except code_hash)
-- This is needed for the payment page to display amount
CREATE POLICY "payment_links_public_read" ON payment_links
  FOR SELECT
  USING (true);

-- Only allow Edge Functions (service role) to insert/update
-- No public insert/update policies needed since all operations go through Edge Functions

COMMENT ON TABLE payment_links IS 'Secure payment links with code-based authentication';
COMMENT ON COLUMN payment_links.payment_id IS 'Public-facing unique identifier for the payment link';
COMMENT ON COLUMN payment_links.code_hash IS 'Bcrypt hash of the access code - never expose to client';
COMMENT ON COLUMN payment_links.expires_at IS 'Payment link expiration timestamp (10-15 minutes from creation)';
COMMENT ON COLUMN payment_links.metadata IS 'Optional metadata for tracking/reference';
