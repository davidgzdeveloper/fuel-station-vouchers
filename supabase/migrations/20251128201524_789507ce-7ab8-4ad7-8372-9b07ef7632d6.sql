-- Create vouchers table
CREATE TABLE public.vouchers (
  id TEXT PRIMARY KEY,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiration_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  beneficiary TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED')),
  used_date TIMESTAMPTZ,
  station TEXT,
  litros DECIMAL(10, 2),
  hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Allow public read access for QR validation (anyone with QR can check status)
CREATE POLICY "Public can view vouchers"
  ON public.vouchers
  FOR SELECT
  USING (true);

-- Allow authenticated users to create vouchers
CREATE POLICY "Authenticated users can create vouchers"
  ON public.vouchers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update voucher status (validation/usage)
CREATE POLICY "Authenticated users can update vouchers"
  ON public.vouchers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_vouchers_status ON public.vouchers(status);
CREATE INDEX idx_vouchers_hash ON public.vouchers(hash);
CREATE INDEX idx_vouchers_issue_date ON public.vouchers(issue_date DESC);