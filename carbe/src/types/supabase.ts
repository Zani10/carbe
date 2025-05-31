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
          requires_approval: boolean
          cancellation_policy: string
          is_available: boolean
          created_at: string
          updated_at: string
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
          requires_approval?: boolean
          cancellation_policy?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
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
          requires_approval?: boolean
          cancellation_policy?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          car_id: string
          renter_id: string
          start_date: string
          end_date: string
          status: string
          payment_intent_id: string | null
          payment_status: string
          total_amount: number
          daily_rate: number
          subtotal: number
          service_fee: number
          special_requests: string | null
          approval_deadline: string | null
          snapshot_first_name: string
          snapshot_last_name: string
          snapshot_email: string
          snapshot_phone: string
          snapshot_license: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          car_id: string
          renter_id: string
          start_date: string
          end_date: string
          status?: string
          payment_intent_id?: string | null
          payment_status?: string
          total_amount: number
          daily_rate: number
          subtotal: number
          service_fee: number
          special_requests?: string | null
          approval_deadline?: string | null
          snapshot_first_name: string
          snapshot_last_name: string
          snapshot_email: string
          snapshot_phone: string
          snapshot_license: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          car_id?: string
          renter_id?: string
          start_date?: string
          end_date?: string
          status?: string
          payment_intent_id?: string | null
          payment_status?: string
          total_amount?: number
          daily_rate?: number
          subtotal?: number
          service_fee?: number
          special_requests?: string | null
          approval_deadline?: string | null
          snapshot_first_name?: string
          snapshot_last_name?: string
          snapshot_email?: string
          snapshot_phone?: string
          snapshot_license?: string
          created_at?: string
          updated_at?: string
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
      geocode_cache: {
        Row: {
          id: string
          address: string
          lat: number
          lng: number
          created_at: string
        }
        Insert: {
          id?: string
          address: string
          lat: number
          lng: number
          created_at?: string
        }
        Update: {
          id?: string
          address?: string
          lat?: number
          lng?: number
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