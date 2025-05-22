export interface Profile {
  id: string;
  full_name: string | null;
  nationality: string | null;
  languages: string[] | null;
  profile_image: string | null;
  verified: boolean;
  created_at: string;
  is_host: boolean;
}