-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  nationality TEXT,
  languages TEXT[],
  profile_image TEXT,
  verified BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'renter',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  description TEXT,
  price_per_day NUMERIC NOT NULL,
  location TEXT,
  transmission TEXT,
  seats INTEGER,
  fuel_type TEXT,
  range_km INTEGER,
  images TEXT[],
  rating NUMERIC,
  lock_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID NOT NULL REFERENCES cars ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users,
  car_id UUID NOT NULL REFERENCES cars ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, car_id)
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  car_id UUID NOT NULL REFERENCES cars ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS Policies

-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Car owners can view renter profiles for their bookings"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN cars c ON b.car_id = c.id
      WHERE b.user_id = profiles.id
      AND c.owner_id = auth.uid()
    )
  );

-- Cars policies
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cars"
  ON cars FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert their own cars"
  ON cars FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own cars"
  ON cars FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own cars"
  ON cars FOR DELETE
  USING (auth.uid() = owner_id);

-- Bookings policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Car owners can view bookings for their cars"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cars
      WHERE cars.id = bookings.car_id
      AND cars.owner_id = auth.uid()
    )
  );

CREATE POLICY "Car owners can update bookings for their cars"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM cars
      WHERE cars.id = bookings.car_id
      AND cars.owner_id = auth.uid()
    )
  );

-- Favorites policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Reviews policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update car rating when review is added or updated
CREATE OR REPLACE FUNCTION update_car_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cars
  SET rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE car_id = NEW.car_id
  )
  WHERE id = NEW.car_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update car rating
CREATE TRIGGER update_car_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_car_rating();

CREATE POLICY "Allow public read access to avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars'); 