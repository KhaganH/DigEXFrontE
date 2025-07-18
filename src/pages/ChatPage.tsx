import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatService, ChatMessage, ChatDetails } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import { useWebSocketChat } from '../hooks/useWebSocketChat';
import { ArrowLeft, Send, User, Package, Clock, MessageCircle, Wifi, WifiOff } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  DELIVERED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Bekləyir',
  DELIVERED: 'Teslim Edildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İmtina',
};

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log('🔍 ChatPage user objesi:', user);
  const [chat, setChat] = useState<ChatDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    navigate('/chats');
  };

  // WebSocket hook'u
  const { isConnected, isConnecting, connect, sendMessage: sendWebSocketMessage } = useWebSocketChat({
    chatId: chatId ? parseInt(chatId) : null,
    onNewMessage: (newMessage) => {
      console.log('🔄 WebSocket\'ten yeni mesaj alındı:', newMessage);
      setMessages(prev => {
        // Mesaj zaten var mı kontrol et
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) {
          return prev;
        }
        return [...prev, newMessage];
      });
    },
    onConnected: () => {
      console.log('✅ WebSocket bağlandı, chat detayları yükleniyor...');
      if (chatId) {
        fetchChatDetails();
      }
    },
    onDisconnected: () => {
      console.log('❌ WebSocket bağlantısı kesildi');
    }
  });

  useEffect(() => {
    if (chatId) {
      // WebSocket bağlantısını kur
      connect();
    }
  }, [chatId, connect]);

  useEffect(() => {
    // Scroll to bottom only when we should (after sending our own message)
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  const fetchChatDetails = async () => {
    if (!chatId) return;
    
    try {
      setIsLoading(true);
      
      // Chat detaylarını al
      const chatResponse = await chatService.getChatDetails(parseInt(chatId));
      if (chatResponse.success && chatResponse.chat) {
        setChat(chatResponse.chat);
      }
      
      // Mesajları ayrı al
      const messagesResponse = await chatService.getChatMessages(parseInt(chatId));
      if (messagesResponse.success && messagesResponse.messages) {
        setMessages(messagesResponse.messages);
      } else {
        setMessages([]); // Mesaj yoksa boş array
      }
      
    } catch (error) {
      console.error('Chat detayları yüklenirken hata:', error);
      setMessages([]); // Hata durumunda boş array
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!input.trim() || !chatId) return;
    
    setSending(true);
    setShouldScrollToBottom(true); // Set flag to scroll after sending message
    try {
      // WebSocket ile mesaj gönder
      const success = sendWebSocketMessage(input.trim());
      if (success) {
        setInput('');
        // Optimistic update kaldırıldı - WebSocket'ten gelecek response'u bekle
      } else {
        // WebSocket başarısız olursa HTTP API kullan
        await chatService.sendMessage(parseInt(chatId), input.trim());
        setInput('');
        // HTTP API kullanıldığında mesajları yeniden yükle
        const messagesResponse = await chatService.getChatMessages(parseInt(chatId));
        if (messagesResponse.success && messagesResponse.messages) {
          setMessages(messagesResponse.messages);
        }
      }
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      setShouldScrollToBottom(false); // Error durumunda scroll'u iptal et
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chat tapılmadı</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Geri dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button 
            onClick={handleBack} 
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-lg truncate">{chat.otherUser.username}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Sipariş: {chat.orderNumber}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0 ml-4">
            <div className="flex items-center space-x-2">
              {/* WebSocket bağlantı durumu */}
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : isConnecting ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </div>
              
              <div className={`text-xs px-2 py-1 rounded-full ${statusColors[chat.status] || 'bg-gray-100 text-gray-800'}`}>
                {statusLabels[chat.status] || chat.status}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate max-w-32">{chat.productTitle}</div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Hələ mesaj yoxdur</p>
              <p className="text-sm text-gray-400 mt-2">İlk mesajı siz göndərin!</p>
            </div>
          ) : (
            messages.map((msg) => {
              console.log('🔍 Mesaj render ediliyor:', msg.id, msg.content);
              const isOwnMessage = (
                msg.senderId === user?.id || 
                msg.sender?.id === user?.id ||
                String(msg.senderId) === String(user?.id) ||
                msg.senderId === Number(user?.id) ||
                (msg.senderUsername && msg.senderUsername === user?.username)
              );
              console.log('🔍 Mesaj ownership kontrolü:', {
                messageId: msg.id,
                senderId: msg.senderId,
                senderUsername: msg.senderUsername,
                senderObj: msg.sender,
                userId: user?.id,
                userUsername: user?.username,
                userObject: user,
                isOwnMessage,
                'senderId === user?.id': msg.senderId === user?.id,
                'sender?.id === user?.id': msg.sender?.id === user?.id,
                'senderUsername === user?.username': msg.senderUsername === user?.username
              });
              return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
                  <div
                    className={`px-3 py-2 rounded-2xl shadow-sm ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {isOwnMessage ? 'Siz' : chat.otherUser.username}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 opacity-70" />
                        <span className="text-xs opacity-70">
                          {formatTime(msg.sentAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-line break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Mesaj yazın..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending}
          />
          <button
            type="button"
            onClick={handleSend}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            disabled={sending || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 
 
 
 
 
 
 
 