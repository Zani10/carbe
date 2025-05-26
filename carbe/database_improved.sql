-- Improved Carbe Database Schema
-- Based on feedback: removed duplicated data, improved precision, and better RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhanced bookings table (main improvements)
CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    renter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Booking details (removed total_days - computed on demand)
    start_date date NOT NULL,
    end_date date NOT NULL,
    
    -- Pricing (increased precision for larger amounts)
    daily_rate numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    service_fee numeric(12,2) NOT NULL DEFAULT 0,
    total_amount numeric(12,2) NOT NULL,
    
    -- Snapshot of renter data at booking time (with clear naming)
    snapshot_first_name text NOT NULL,
    snapshot_last_name text NOT NULL,
    snapshot_email text NOT NULL,
    snapshot_phone text NOT NULL,
    snapshot_license_number text NOT NULL,
    special_requests text,
    
    -- Booking status
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    
    -- Enhanced payment information
    payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    stripe_customer_id text, -- For easier customer management
    stripe_payment_intent_id text, -- For refunds and debugging
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT valid_amounts CHECK (
        daily_rate > 0 AND 
        subtotal > 0 AND 
        service_fee >= 0 AND 
        total_amount > 0
    )
);

-- Car availability blocking table (unchanged - already good)
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

-- Booking reviews table (unchanged - already good)
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

-- Enhanced Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reviews ENABLE ROW LEVEL SECURITY;

-- Improved bookings policies with specific column permissions
CREATE POLICY "Renters can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = renter_id);

CREATE POLICY "Car owners can view bookings for their cars" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cars 
            WHERE cars.id = bookings.car_id 
            AND cars.owner_id = auth.uid()
        )
    );

CREATE POLICY "Renters can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = renter_id);

-- Separate policies for different update scenarios
CREATE POLICY "Renters can cancel their bookings" ON bookings
    FOR UPDATE USING (auth.uid() = renter_id)
    WITH CHECK (
        -- Renters can only change status to cancelled and update special_requests
        status IN ('pending', 'cancelled') AND
        (OLD.status != 'cancelled' OR status = 'cancelled')
    );

CREATE POLICY "Car owners can manage booking status" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cars 
            WHERE cars.id = bookings.car_id 
            AND cars.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        -- Car owners can confirm, activate, or complete bookings
        status IN ('confirmed', 'active', 'completed', 'cancelled') AND
        -- Cannot modify renter snapshot data or pricing
        snapshot_first_name = OLD.snapshot_first_name AND
        snapshot_last_name = OLD.snapshot_last_name AND
        snapshot_email = OLD.snapshot_email AND
        snapshot_phone = OLD.snapshot_phone AND
        snapshot_license_number = OLD.snapshot_license_number AND
        daily_rate = OLD.daily_rate AND
        subtotal = OLD.subtotal AND
        service_fee = OLD.service_fee AND
        total_amount = OLD.total_amount
    );

-- Car availability policies (unchanged - already good)
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

-- Booking reviews policies (unchanged - already good)
CREATE POLICY "Users can view reviews" ON booking_reviews
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Renters can create reviews for their completed bookings" ON booking_reviews
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

-- Enhanced Functions and Triggers

-- Function to automatically update car availability when booking is created/updated
CREATE OR REPLACE FUNCTION update_car_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove old availability block if updating
    IF TG_OP = 'UPDATE' AND OLD.id IS NOT NULL THEN
        DELETE FROM car_availability 
        WHERE booking_id = OLD.id;
    END IF;
    
    -- Create new availability block for confirmed & active bookings
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

-- Enhanced function to check car availability with better conflict detection
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
            -- Overlapping date ranges
            (start_date <= p_start_date AND end_date > p_start_date) OR
            (start_date < p_end_date AND end_date >= p_end_date) OR
            (start_date >= p_start_date AND end_date <= p_end_date)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Helper function to calculate booking total days
CREATE OR REPLACE FUNCTION calculate_booking_days(
    p_start_date date,
    p_end_date date
) RETURNS integer AS $$
BEGIN
    RETURN (p_end_date - p_start_date) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get booking summary with computed fields
CREATE OR REPLACE FUNCTION get_booking_summary(p_booking_id uuid)
RETURNS TABLE (
    booking_id uuid,
    total_days integer,
    car_make text,
    car_model text,
    car_year integer,
    host_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        calculate_booking_days(b.start_date, b.end_date),
        c.make,
        c.model,
        c.year,
        p.full_name
    FROM bookings b
    JOIN cars c ON b.car_id = c.id
    LEFT JOIN profiles p ON c.owner_id = p.id
    WHERE b.id = p_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_reviews_updated_at ON booking_reviews;
CREATE TRIGGER update_booking_reviews_updated_at
    BEFORE UPDATE ON booking_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 