import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { Chat, ChatMessage } from '../types/Chat';
import { useWebSocketChat } from '../hooks/useWebSocketChat';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';

interface ChatsLayoutProps {
  currentChatId?: number | null;
  onNavigate?: (page: 'home' | 'login' | 'register' | 'cart' | 'checkout' | 'checkout-success' | 'orders' | 'order-detail' | 'chats' | 'chat' | 'seller-request', id?: number) => void;
  isOrderBasedChat?: boolean;
}

export const ChatsLayout: React.FC<ChatsLayoutProps> = ({ 
  currentChatId: propChatId, 
  onNavigate, 
  isOrderBasedChat: propIsOrderBasedChat 
}) => {
  // URL parametrelerini prop'lardan al
  const chatId = propChatId?.toString();
  const orderId = propIsOrderBasedChat ? propChatId?.toString() : undefined;
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(propChatId || null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const chatsInitializedRef = useRef(false);

  // WebSocket connection handling
  const handleNewMessage = useCallback((message: ChatMessage) => {
    console.log('🎯 ChatsLayout handleNewMessage çağrıldı:', message);
    setMessages(prev => {
      const exists = prev.some(m => m.id === message.id);
      if (exists) {
        console.log('⚠️ Mesaj zaten mevcut, eklenmedi');
        return prev;
      }
      
      const newMessages = [...prev, message];
      console.log('✅ Yeni mesaj eklendi, toplam mesaj sayısı:', newMessages.length);
      
      // Don't auto-scroll to prevent page jumping
      
      return newMessages;
    });
    
    // Not updating unread count here since if we're in a chat, new messages shouldn't be marked as unread
    // Unread count will be updated when user switches chats or when messages are loaded from server
  }, []);

  const handleWebSocketConnected = useCallback(() => {
    setConnectionStatus('connected');
  }, []);

  const handleWebSocketDisconnected = useCallback(() => {
    setConnectionStatus('disconnected');
  }, []);

  const {
    isConnected,
    isConnecting,
    connect,
    sendMessage: sendWebSocketMessage
  } = useWebSocketChat({
    chatId: selectedChatId,
    onNewMessage: handleNewMessage,
    onConnected: handleWebSocketConnected,
    onDisconnected: handleWebSocketDisconnected
  });

  // Update connection status
  useEffect(() => {
    if (isConnecting) {
      setConnectionStatus('connecting');
    } else if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnecting, isConnected]);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = authService.getToken();
    if (token && !isConnected && !isConnecting) {
      connect();
    }
  }, [connect, isConnected, isConnecting]);

  // Load chat list
  const loadChats = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        if (onNavigate) {
          onNavigate('login');
        } else {
          // Fallback: redirect to login page
          window.location.href = '/auth/login';
        }
        return;
      }

      const chatsData = await chatService.getUserChats();
      
      // Her chat için otherUser'ı hesapla
      const currentUser = authService.getCurrentUser();
      const processedChats = chatsData.map(chat => {
        // Mevcut kullanıcı buyer ise seller'ı göster, değilse buyer'ı göster
        const otherUser = currentUser?.id === chat.buyer.id ? chat.seller : chat.buyer;
        return {
          ...chat,
          otherUser
        };
      });
      
      setChats(processedChats);
    } catch (error) {
      console.error('Chat listesi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [onNavigate]);

  // Load messages for selected chat
  const loadMessages = useCallback(async (chatId: number) => {
    try {
      const messagesData = await chatService.getChatMessages(chatId);
      setMessages(messagesData);
      
      // Don't auto-scroll on load to prevent page jumping
      
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    }
  }, []);

  // Clear unread count for selected chat
  const clearUnreadCount = useCallback((chatId: number) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, unreadCount: 0 }
        : chat
    ));
  }, []);

  // Handle chat selection
  const handleChatSelect = useCallback((chat: Chat) => {
    setSelectedChatId(chat.id);
    setCurrentChat(chat);
    loadMessages(chat.id);
    clearUnreadCount(chat.id);
    if (onNavigate) {
      onNavigate('chat', chat.id);
    } else {
      // Fallback: update URL manually
      window.history.pushState({}, '', `/chat/${chat.id}`);
    }
  }, [loadMessages, clearUnreadCount, onNavigate]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId || sendingMessage) return;

    setSendingMessage(true);
    try {
      // Try WebSocket first
      if (isConnected) {
        const success = sendWebSocketMessage(newMessage.trim());
        if (success) {
          setNewMessage('');
          setSendingMessage(false);
          return;
        }
      }

      // Fallback to HTTP if WebSocket fails
      await chatService.sendMessage(selectedChatId, newMessage.trim());
      setNewMessage('');
      
      // Reload messages to show the sent message
      loadMessages(selectedChatId);
      
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Handle URL parameters when they change
  useEffect(() => {
    if (chats.length === 0) return; // Wait for chats to load
    
    if (orderId) {
      // Convert order ID to chat ID
      chatService.getChatByOrderId(parseInt(orderId))
        .then(chat => {
          if (chat) {
            setSelectedChatId(chat.id);
            setCurrentChat(chat);
            // Load messages inline
            chatService.getChatMessages(chat.id)
              .then(messagesData => {
                setMessages(messagesData);
                // Don't auto-scroll on load to prevent page jumping
              })
              .catch(error => console.error('Mesajlar yüklenirken hata:', error));
          }
        })
        .catch(error => {
          console.error('Order chat bulunamadı:', error);
          if (onNavigate) {
            onNavigate('chats');
          } else {
            // Fallback: update URL manually
            window.history.pushState({}, '', '/chat');
          }
        });
    } else if (chatId) {
      const chat = chats.find(c => c.id === parseInt(chatId));
      if (chat) {
        setSelectedChatId(chat.id);
        setCurrentChat(chat);
        // Load messages inline
        chatService.getChatMessages(chat.id)
          .then(messagesData => {
            setMessages(messagesData);
            // Don't auto-scroll on load to prevent page jumping
          })
          .catch(error => console.error('Mesajlar yüklenirken hata:', error));
      }
    }
  }, [chatId, orderId, onNavigate]);

  // Check URL parameters when chats are first loaded
  useEffect(() => {
    if (chats.length > 0 && !chatsInitializedRef.current) {
      chatsInitializedRef.current = true;
      
      // Only run if we have URL parameters
      if (chatId || orderId) {
        if (orderId) {
          // Convert order ID to chat ID
          chatService.getChatByOrderId(parseInt(orderId))
            .then(chat => {
              if (chat) {
                setSelectedChatId(chat.id);
                setCurrentChat(chat);
                // Load messages inline
                chatService.getChatMessages(chat.id)
                  .then(messagesData => {
                    setMessages(messagesData);
                    // Don't auto-scroll on load to prevent page jumping
                  })
                  .catch(error => console.error('Mesajlar yüklenirken hata:', error));
              }
            })
            .catch(error => {
              console.error('Order chat bulunamadı:', error);
              if (onNavigate) {
                onNavigate('chats');
              } else {
                // Fallback: update URL manually
                window.history.pushState({}, '', '/chat');
              }
            });
        } else if (chatId) {
          const chat = chats.find(c => c.id === parseInt(chatId));
          if (chat) {
            setSelectedChatId(chat.id);
            setCurrentChat(chat);
            // Load messages inline
            chatService.getChatMessages(chat.id)
              .then(messagesData => {
                setMessages(messagesData);
                // Don't auto-scroll on load to prevent page jumping
              })
              .catch(error => console.error('Mesajlar yüklenirken hata:', error));
          }
        }
      }
    }
  }, [chats.length, chatId, orderId, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chatler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '80vh' }}>
          <div className="flex h-full">
            
            {/* Chat List */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 ${selectedChatId ? 'hidden md:block' : ''}`}>
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Mesajlar
                  </h2>
                  
                  {/* Connection Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500' : 
                      connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-600">
                      {connectionStatus === 'connected' ? 'Çevrimiçi' :
                       connectionStatus === 'connecting' ? 'Bağlanıyor...' : 'Çevrimdışı'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 73px)' }}>
                {chats.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Henüz hiç mesajınız yok</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleChatSelect(chat)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChatId === chat.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {chat.otherUser?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          {chat.unreadCount && chat.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {chat.otherUser?.username || 'Bilinmeyen Kullanıcı'}
                            </p>
                            {chat.unreadCount && chat.unreadCount > 0 && (
                              <span className="text-xs text-red-500 font-medium">
                                +{chat.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {chat.order?.product?.title || 'Ürün bilgisi yok'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Sipariş #{chat.order?.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className={`flex-1 flex flex-col ${!selectedChatId ? 'hidden md:flex' : ''}`}>
              {selectedChatId ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedChatId(null);
                          setCurrentChat(null);
                          if (onNavigate) {
                            onNavigate('chats');
                          } else {
                            // Fallback: update URL manually
                            window.history.pushState({}, '', '/chat');
                          }
                        }}
                        className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {currentChat?.otherUser?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {currentChat?.otherUser?.username || 'Bilinmeyen Kullanıcı'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {currentChat?.order?.product?.title || 'Ürün bilgisi yok'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Henüz hiç mesaj yok. İlk mesajı gönderin!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const currentUser = authService.getCurrentUser();
                        const isOwnMessage = (
                          message.senderId === currentUser?.id ||
                          message.sender?.id === currentUser?.id ||
                          String(message.senderId) === String(currentUser?.id) ||
                          (message.senderUsername && message.senderUsername === currentUser?.username)
                        );
                        
                        console.log('🔍 ChatsLayout ownership kontrolü:', {
                          messageId: message.id,
                          content: message.content,
                          senderId: message.senderId,
                          senderUsername: message.senderUsername,
                          senderObj: message.sender,
                          currentUserId: currentUser?.id,
                          currentUsername: currentUser?.username,
                          isOwnMessage
                        });
                        
                        return (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.type === 'SYSTEM'
                              ? 'justify-center'
                              : isOwnMessage
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          {message.type === 'SYSTEM' ? (
                            <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg text-sm max-w-md mx-auto my-2">
                              <div className="text-center">
                                {message.content}
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                              }`}
                            >
                              <p className="break-words">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {new Date(message.sentAt).toLocaleTimeString('tr-TR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                        )
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={sendingMessage}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage || !isConnected}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Status Messages */}
                    {!isConnected && (
                      <p className="text-xs text-orange-600 mt-2">
                        🔄 Gerçek zamanlı mesajlaşma bağlantısı kuruluyor...
                      </p>
                    )}
                    {sendingMessage && (
                      <p className="text-xs text-blue-600 mt-2">
                        📤 Mesaj gönderiliyor...
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Mesajlarınız</h3>
                    <p>Konuşmaya başlamak için sol taraftan bir chat seçin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default ChatsLayout;