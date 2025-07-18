import React, { useEffect, useState } from 'react';
import { chatService, ChatRoom } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import { MessageCircle, User, Package, ChevronRight, ChevronLeft, Search } from 'lucide-react';

interface ChatsPageProps {
  onChatSelect: (chatId: number) => void;
}

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

const ChatsPage: React.FC<ChatsPageProps> = ({ onChatSelect }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const response = await chatService.getChatRooms();
      console.log('🔍 getChatRooms response:', response);
      
      if (response.success && response.chats) {
        setChats(response.chats);
        setFilteredChats(response.chats);
      } else {
        console.error('❌ Chat rooms response error:', response);
        setChats([]);
        setFilteredChats([]);
      }
    } catch (error) {
      console.error('❌ Error fetching chat rooms:', error);
      setChats([]);
      setFilteredChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter chats based on search term
  useEffect(() => {
    const filtered = chats.filter(chat => 
      chat.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChats(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [chats, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredChats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChats = filteredChats.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold flex items-center mb-8">
          <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
          Mesajlar
        </h1>
        
        {/* Search and Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Söhbət, sipariş və ya məhsul axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>
          <div className="text-gray-500">
            Toplam {filteredChats.length} söhbət
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-400">Yüklənir...</div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center text-gray-400">
              {searchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Hələ söhbət yoxdur'}
            </div>
          ) : (
            currentChats.map((chat) => (
              <div
                key={chat.id}
                className="bg-white rounded-xl shadow flex items-center justify-between p-4 hover:bg-blue-50 cursor-pointer transition"
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{chat.otherUser.username}</div>
                    <div className="text-sm text-gray-500">Sipariş: {chat.orderNumber}</div>
                    <div className="text-xs text-gray-400 truncate max-w-xs">{chat.productTitle}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1 min-w-[120px]">
                  <div className="text-xs text-gray-500">{new Date(chat.lastMessageAt).toLocaleDateString('az-AZ')}</div>
                  <div className={`text-xs px-2 py-1 rounded ${statusColors[chat.status] || 'bg-gray-100 text-gray-800'}`}>{statusLabels[chat.status] || chat.status}</div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 ml-4" />
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage; 
 
 
 
 
 
 