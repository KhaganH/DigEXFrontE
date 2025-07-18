import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../services/chatService';

interface UseWebSocketChatProps {
  chatId: number | null;
  onNewMessage: (message: ChatMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const useWebSocketChat = ({ 
  chatId, 
  onNewMessage, 
  onConnected, 
  onDisconnected 
}: UseWebSocketChatProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<any>(null);

  // WebSocket bağlantısını kur
  const connect = useCallback(() => {
    if (isConnecting || isConnected) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('❌ Auth token bulunamadı, WebSocket bağlantısı kurulamıyor');
      return;
    }

    console.log('🔑 WebSocket bağlantısı kuruluyor, token:', `Bearer ${token.substring(0, 20)}...`);
    setIsConnecting(true);
    
    try {
      const socket = new SockJS('http://localhost:1111/ws');
      const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          console.log('🔌 STOMP Debug:', str);
        },
        onConnect: () => {
          console.log('✅ WebSocket bağlandı!');
          setIsConnected(true);
          setIsConnecting(false);
          onConnected?.();
        },
        onDisconnect: () => {
          console.log('❌ WebSocket bağlantısı kesildi');
          setIsConnected(false);
          setIsConnecting(false);
          onDisconnected?.();
        },
        onStompError: (frame) => {
          console.error('❌ STOMP hatası:', frame);
          setIsConnecting(false);
        },
        onWebSocketError: (error) => {
          console.error('❌ WebSocket hatası:', error);
          setIsConnecting(false);
        }
      });

      clientRef.current = client;
      client.activate();
    } catch (error) {
      console.error('❌ WebSocket bağlantı hatası:', error);
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, onConnected, onDisconnected]);

  // Chat'e abone ol
  const subscribeToChat = useCallback((chatId: number) => {
    if (!clientRef.current?.connected) {
      console.warn('⚠️ WebSocket bağlı değil, chat\'e abone olunamıyor');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('⚠️ Auth token bulunamadı');
      return;
    }

    // Önceki subscription'ı kapat
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Chat'e join ol
    clientRef.current.publish({
      destination: `/app/chat/${chatId}/join`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ chatId })
    });

    // Chat mesajlarına abone ol
    subscriptionRef.current = clientRef.current.subscribe(
      `/topic/chat/${chatId}`,
      (message) => {
        console.log('🔄 Raw WebSocket mesajı alındı:', message.body);
        try {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          console.log('📨 Parse edilmiş WebSocket mesajı:', chatMessage);
          console.log('🔍 WebSocket mesaj senderId:', chatMessage.senderId);
          console.log('🔍 WebSocket mesaj sender:', chatMessage.sender);
          onNewMessage(chatMessage);
        } catch (error) {
          console.error('❌ WebSocket mesaj parse hatası:', error);
        }
      }
    );

    console.log(`🔔 Chat ${chatId}'e abone olundu`);
  }, [onNewMessage]);

  // Chat'ten ayrıl
  const unsubscribeFromChat = useCallback((chatId: number) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (clientRef.current?.connected) {
      const token = localStorage.getItem('authToken');
      clientRef.current.publish({
        destination: `/app/chat/${chatId}/leave`,
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {},
        body: JSON.stringify({ chatId })
      });
    }

    console.log(`🔕 Chat ${chatId}'ten ayrıldı`);
  }, []);

  // Mesaj gönder
  const sendMessage = useCallback((content: string) => {
    if (!chatId || !clientRef.current?.connected) {
      console.warn('⚠️ WebSocket bağlı değil veya chat seçili değil');
      return false;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('⚠️ Auth token bulunamadı');
      return false;
    }

    try {
      clientRef.current.publish({
        destination: `/app/chat/${chatId}/send`,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      console.log('📤 WebSocket mesaj gönderildi:', content);
      console.log('🔑 Authorization header:', `Bearer ${token.substring(0, 20)}...`);
      return true;
    } catch (error) {
      console.error('❌ WebSocket mesaj gönderme hatası:', error);
      return false;
    }
  }, [chatId]);

  // Bağlantıyı kapat
  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // ChatId değiştiğinde subscription'ı güncelle
  useEffect(() => {
    if (isConnected && chatId) {
      subscribeToChat(chatId);
      return () => {
        if (chatId) {
          unsubscribeFromChat(chatId);
        }
      };
    }
  }, [isConnected, chatId, subscribeToChat, unsubscribeFromChat]);

  // Component unmount olduğunda bağlantıyı kapat
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    subscribeToChat,
    unsubscribeFromChat
  };
}; 
 
 