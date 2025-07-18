import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';
import notificationService, { Notification } from '../services/notificationService';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // API'den bildirişləri yüklə
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const notificationsData = await notificationService.getAllNotifications();
        setNotifications(notificationsData);
      } catch (err) {
        setError('Bildirişlər yüklənərkən xəta baş verdi');
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const totalCount = notifications.length;

  const markAsRead = async (notificationId: number) => {
    try {
      setLoading(true);
      const response = await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setSuccess(response.message);
    } catch (err) {
      setError('Bildiriş oxunmuş işarələnərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!window.confirm('Bu bildirişi silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      setLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSuccess('Bildiriş silindi');
    } catch (err) {
      setError('Bildiriş silinərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await notificationService.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setSuccess(response.message);
    } catch (err) {
      setError('Bildirişlər oxunmuş işarələnərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const deleteAllRead = async () => {
    if (!window.confirm('Bütün oxunmuş bildirişləri silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await notificationService.deleteReadNotifications();
      
      setNotifications(prev => prev.filter(n => !n.isRead));
      setSuccess(response.message);
    } catch (err) {
      setError('Bildirişlər silinərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'error':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-info-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alert Messages */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-2">
            <i className="fas fa-bell text-purple-600"></i>
            Bildirişlər
          </h1>
          <p className="text-gray-600">Hesabınız və fəaliyyətlərinizlə bağlı bildirişlər</p>
          
          {/* Stats */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg px-6 py-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
              <div className="text-sm text-gray-600">Ümumi</div>
            </div>
            <div className="bg-gray-50 rounded-lg px-6 py-4 border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Oxunmamış</div>
            </div>
          </div>
        </div>

        {/* Notifications Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h5 className="text-lg font-semibold text-gray-800">Bildirişlərim</h5>
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                disabled={loading || unreadCount === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-check-double"></i>
                Hamısını oxunmuş işarələ
              </button>
              <button
                onClick={deleteAllRead}
                disabled={loading || notifications.filter(n => n.isRead).length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-trash"></i>
                Oxunmuşları sil
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {notifications.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16 px-4">
                <i className="fas fa-bell-slash text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Bildiriş yoxdur</h3>
                <p className="text-gray-600">Hazırda heç bir bildirişiniz yoxdur. Yeni fəaliyyətlər olduqda burada görünəcək.</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div 
                  key={notification.id} 
                  className={`p-6 border-b border-gray-200 last:border-b-0 transition-colors hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-2">
                        {notification.title}
                      </div>
                      <div className="text-gray-600 mb-3 leading-relaxed">
                        {notification.message}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <i className="fas fa-clock"></i>
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              disabled={loading}
                              className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors disabled:opacity-50"
                            >
                              <i className="fas fa-check"></i>
                              Oxunmuş
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors disabled:opacity-50"
                          >
                            <i className="fas fa-trash"></i>
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <i className="fas fa-spinner animate-spin text-purple-600 text-xl"></i>
              <span className="text-gray-700">Yüklənir...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 