export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string
          owner_id: string
          make: string
          model: string
          year: number
          description: string | null
          price_per_day: number
          location: string | null
          transmission: string | null
          seats: number | null
          fuel_type: string | null
          range_km: number | null
          images: string[] | null
          rating: number | null
          lock_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          make: string
          model: string
          year: number
          description?: string | null
          price_per_day: number
          location?: string | null
          transmission?: string | null
          seats?: number | null
          fuel_type?: string | null
          range_km?: number | null
          images?: string[] | null
          rating?: number | null
          lock_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          make?: string
          model?: string
          year?: number
          description?: string | null
          price_per_day?: number
          location?: string | null
          transmission?: string | null
          seats?: number | null
          fuel_type?: string | null
          range_km?: number | null
          images?: string[] | null
          rating?: number | null
          lock_type?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          car_id: string
          user_id: string
          start_date: string
          end_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          car_id: string
          user_id: string
          start_date: string
          end_date: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          car_id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          status?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          nationality: string | null
          languages: string | null
          profile_image: string | null
          verified: boolean
          role: string
          is_host: boolean
          location: string | null
          work: string | null
          education: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          nationality?: string | null
          languages?: string | null
          profile_image?: string | null
          verified?: boolean
          role?: string
          is_host?: boolean
          location?: string | null
          work?: string | null
          education?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          nationality?: string | null
          languages?: string | null
          profile_image?: string | null
          verified?: boolean
          role?: string
          is_host?: boolean
          location?: string | null
          work?: string | null
          education?: string | null
          bio?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 