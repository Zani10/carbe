-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  nationality TEXT,
  languages TEXT,
  profile_image TEXT,
  verified BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'renter',
  is_host BOOLEAN DEFAULT false,
  location TEXT,
  work TEXT,
  education TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
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
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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

CREATE TABLE geocode_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL UNIQUE,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
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

-- Geocode cache policies
ALTER TABLE geocode_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view geocode cache"
  ON geocode_cache FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert geocode cache"
  ON geocode_cache FOR INSERT
  WITH CHECK (true);

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

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    renter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Booking details
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    
    -- Pricing
    daily_rate numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    service_fee numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    
    -- Renter information
    renter_first_name text NOT NULL,
    renter_last_name text NOT NULL,
    renter_email text NOT NULL,
    renter_phone text NOT NULL,
    renter_license_number text NOT NULL,
    special_requests text,
    
    -- Booking status
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    
    -- Payment information
    payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_intent_id text, -- For Stripe integration
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT valid_total_days CHECK (total_days > 0),
    CONSTRAINT valid_amounts CHECK (
        daily_rate > 0 AND 
        subtotal > 0 AND 
        service_fee >= 0 AND 
        total_amount > 0
    )
);

-- Car availability blocking table
CREATE TABLE IF NOT EXISTS public.car_availability (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text NOT NULL DEFAULT 'booked' CHECK (reason IN ('booked', 'maintenance', 'unavailable')),
    booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_availability_range CHECK (end_date >= start_date)
);

-- Booking reviews table (for after rental completion)
CREATE TABLE IF NOT EXISTS public.booking_reviews (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Review details
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title text,
    comment text,
    
    -- Review categories
    cleanliness_rating integer CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    performance_rating integer CHECK (performance_rating >= 1 AND performance_rating <= 5),
    value_rating integer CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Ensure one review per booking
    UNIQUE(booking_id, reviewer_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_car_availability_car_dates ON car_availability(car_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_booking_reviews_car_id ON booking_reviews(car_id);
CREATE INDEX IF NOT EXISTS idx_geocode_cache_address ON geocode_cache(address);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reviews ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = renter_id);

CREATE POLICY "Car owners can view bookings for their cars" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cars 
            WHERE cars.id = bookings.car_id 
            AND cars.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users can update their own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = renter_id);

CREATE POLICY "Car owners can update booking status" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cars 
            WHERE cars.id = bookings.car_id 
            AND cars.owner_id = auth.uid()
        )
    );

-- Car availability policies
CREATE POLICY "Everyone can view car availability" ON car_availability
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Car owners can manage availability" ON car_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cars 
            WHERE cars.id = car_availability.car_id 
            AND cars.owner_id = auth.uid()
        )
    );

CREATE POLICY "System can create availability blocks for bookings" ON car_availability
    FOR INSERT WITH CHECK (true);

-- Booking reviews policies
CREATE POLICY "Users can view reviews" ON booking_reviews
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Renters can create reviews for their bookings" ON booking_reviews
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = booking_reviews.booking_id 
            AND bookings.renter_id = auth.uid()
            AND bookings.status = 'completed'
        )
    );

CREATE POLICY "Users can update their own reviews" ON booking_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- Functions and Triggers

-- Function to automatically update car availability when booking is created/updated
CREATE OR REPLACE FUNCTION update_car_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove old availability block if updating
    IF TG_OP = 'UPDATE' AND OLD.id IS NOT NULL THEN
        DELETE FROM car_availability 
        WHERE booking_id = OLD.id;
    END IF;
    
    -- Create new availability block for confirmed bookings
    IF NEW.status IN ('confirmed', 'active') THEN
        INSERT INTO car_availability (car_id, start_date, end_date, reason, booking_id)
        VALUES (NEW.car_id, NEW.start_date, NEW.end_date, 'booked', NEW.id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update car availability
DROP TRIGGER IF EXISTS trigger_update_car_availability ON bookings;
CREATE TRIGGER trigger_update_car_availability
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_car_availability();

-- Function to update car rating when review is added
CREATE OR REPLACE FUNCTION update_car_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE cars 
    SET rating = (
        SELECT AVG(rating)::numeric(3,2) 
        FROM booking_reviews 
        WHERE car_id = NEW.car_id
    )
    WHERE id = NEW.car_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update car rating
DROP TRIGGER IF EXISTS trigger_update_car_rating ON booking_reviews;
CREATE TRIGGER trigger_update_car_rating
    AFTER INSERT OR UPDATE ON booking_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_car_rating();

-- Function to check car availability
CREATE OR REPLACE FUNCTION check_car_availability(
    p_car_id uuid,
    p_start_date date,
    p_end_date date
) RETURNS boolean AS $$
BEGIN
    -- Check if there are any conflicting availability blocks
    RETURN NOT EXISTS (
        SELECT 1 FROM car_availability
        WHERE car_id = p_car_id
        AND (
            (start_date <= p_start_date AND end_date > p_start_date) OR
            (start_date < p_end_date AND end_date >= p_end_date) OR
            (start_date >= p_start_date AND end_date <= p_end_date)
        )
    );
END;
$$ LANGUAGE plpgsql; 