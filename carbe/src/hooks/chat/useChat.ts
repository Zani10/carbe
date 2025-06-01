import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Message, MessageInput, ChatState } from '@/types/message';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useChat = (conversationId?: string) => {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>({
    conversations: [],
    messages: [],
    loading: false,
    typing: false,
  });

  // Fetch conversations for current user
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
             const { data, error } = await supabase
         .from('conversations')
         .select(`
           *,
           car:cars(*),
           booking:bookings(*),
           host:profiles!host_id(*),
           renter:profiles!renter_id(*),
           last_message:messages(*)
         `)
         .or(`host_id.eq.${user.id},renter_id.eq.${user.id}`)
         .order('last_message_at', { ascending: false });

      if (error) throw error;

             // Process conversations and add unread counts
       const conversationsWithUnread = await Promise.all(
         (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            ...conv,
            unread_count: count || 0,
          };
        })
      );

      setState(prev => ({
        ...prev,
        conversations: conversationsWithUnread,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load conversations',
        loading: false,
      }));
    }
  }, [user]);

  // Fetch conversation details
  const fetchConversation = useCallback(async (convId: string) => {
    if (!user) return;

    try {
      // First get the basic conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', convId)
        .single();

      if (convError) throw convError;

      // Then get the car details
      let car = null;
      if (conversation.car_id) {
        const { data: carData } = await supabase
          .from('cars')
          .select('*')
          .eq('id', conversation.car_id)
          .single();
        car = carData;
      }

      // Get the booking details if exists
      let booking = null;
      if (conversation.booking_id) {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', conversation.booking_id)
          .single();
        booking = bookingData;
      }

      // Get host and renter profiles
      const { data: hostProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', conversation.host_id)
        .single();

      const { data: renterProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', conversation.renter_id)
        .single();

      const enrichedConversation = {
        ...conversation,
        car,
        booking,
        host: hostProfile,
        renter: renterProfile,
      };


      setState(prev => ({
        ...prev,
        currentConversation: enrichedConversation,
      }));

      return enrichedConversation;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load conversation',
      }));
      return null;
    }
  }, [user]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (convId: string) => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        messages: data || [],
        loading: false,
      }));

      // Mark messages as read
      await markMessagesAsRead(convId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load messages',
        loading: false,
      }));
    }
  }, [user]);

  // Send a new message
  const sendMessage = useCallback(async (input: MessageInput, convId: string) => {
    if (!user || !input.content.trim()) return;

    try {
      const messageData = {
        conversation_id: convId,
        sender_id: user.id,
        content: input.content.trim(),
        message_type: input.message_type,
        file_url: input.file ? await uploadFile(input.file) : null,
        file_name: input.file?.name || null,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', convId);

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, data],
      }));

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to send message',
      }));
    }
  }, [user]);

  // Create or get conversation
  const createOrGetConversation = useCallback(async (
    carId: string,
    hostId: string,
    bookingId?: string
  ) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('car_id', carId)
        .eq('host_id', hostId)
        .eq('renter_id', user.id)
        .maybeSingle();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          car_id: carId,
          host_id: hostId,
          renter_id: user.id,
          booking_id: bookingId,
          last_message_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [user]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (convId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', convId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  // Upload file helper
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages in current conversation
    let messageSubscription: RealtimeChannel | null = null;
    if (conversationId) {
      messageSubscription = supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newMessage = payload.new as Message;
              setState(prev => ({
                ...prev,
                messages: [...prev.messages, newMessage],
              }));
              
              // Mark as read if not from current user
              if (newMessage.sender_id !== user.id) {
                markMessagesAsRead(conversationId);
              }
            }
          }
        )
        .subscribe();
    }

    // Subscribe to conversation updates
    const conversationSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(host_id.eq.${user.id},renter_id.eq.${user.id})`,
        },
        () => {
          // Refresh conversations on any change
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
      }
      supabase.removeChannel(conversationSubscription);
    };
  }, [user, conversationId, fetchConversations, markMessagesAsRead]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchConversations();
      if (conversationId) {
        fetchConversation(conversationId);
        fetchMessages(conversationId);
      }
    }
  }, [user, conversationId, fetchConversations, fetchConversation, fetchMessages]);

  return {
    ...state,
    sendMessage,
    createOrGetConversation,
    markMessagesAsRead,
    fetchConversations,
    fetchConversation,
    fetchMessages,
  };
};
