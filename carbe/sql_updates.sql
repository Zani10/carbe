-- Add geocode_cache table for map functionality
CREATE TABLE IF NOT EXISTS geocode_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL UNIQUE,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for geocode_cache
ALTER TABLE geocode_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view geocode cache"
  ON geocode_cache FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert geocode cache"
  ON geocode_cache FOR INSERT
  WITH CHECK (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_geocode_cache_address ON geocode_cache(address);

-- Update cars table to ensure is_available and updated_at columns exist
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add trigger to update updated_at for cars table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cars_updated_at ON cars;
CREATE TRIGGER update_cars_updated_at
    BEFORE UPDATE ON cars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 