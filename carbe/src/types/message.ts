export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  image_url?: string;
}

export interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  car_id: string;
  booking_id?: string; // Optional - can exist before booking
  host_id: string;
  renter_id: string;
  last_message?: Message;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  
  // Populated fields
  car?: Car;
  booking?: Booking;
  host?: User;
  renter?: User;
  unread_count?: number;
}

export interface MessageInput {
  content: string;
  message_type: 'text' | 'image' | 'file';
  file?: File;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation?: Conversation;
  messages: Message[];
  loading: boolean;
  typing: boolean;
  error?: string;
}
