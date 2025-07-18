import { apiClient } from './api';

export interface BalanceStats {
  currentBalance: number;
  totalDeposits: number;
  totalPurchases: number;
  totalWithdrawals: number;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  balanceAfter: number;
  balanceBefore: number;
}

export interface PageableTransactionResponse {
  content: Transaction[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaymentResponse {
  paymentUrl: string;
  success: boolean;
  message?: string;
}

class BalanceService {
  
  async getBalanceStats(): Promise<BalanceStats> {
    try {
      // Ana balance API'den balance'ı alıyoruz
      const balanceResponse = await apiClient.get<{success: boolean, balance: number}>('/api/balance');
      const balance = balanceResponse.balance || 0;

      // Diğer istatistikler için ayrı API'ler
      const [deposits, purchases] = await Promise.all([
        apiClient.get<number>('/api/balance/stats/deposits'),
        apiClient.get<number>('/api/balance/stats/purchases')
      ]);

      return {
        currentBalance: balance,
        totalDeposits: deposits,
        totalPurchases: purchases,
        totalWithdrawals: 0 // Şimdilik 0, eğer varsa API'den alınabilir
      };
    } catch (error) {
      console.error('❌ Error getting balance stats:', error);
      throw error;
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      const transactions = await apiClient.get<Transaction[]>('/api/balance/transactions');
      return transactions;
    } catch (error) {
      console.error('❌ Error getting transactions:', error);
      throw error;
    }
  }

  async getPageableTransactions(page: number = 0, size: number = 10, filter: string = 'all'): Promise<PageableTransactionResponse> {
    try {
      // Mevcut API'den tüm transaction'ları al ve manuel sayfalama yap
      let transactions = await this.getTransactions();
      
      // Filtreleme
      if (filter !== 'all') {
        transactions = transactions.filter(t => t.type === filter);
      }
      
      // Sayfalama
      const start = page * size;
      const end = start + size;
      const paginatedTransactions = transactions.slice(start, end);
      
      const totalPages = Math.ceil(transactions.length / size);
      
      return {
        content: paginatedTransactions,
        currentPage: page,
        totalPages,
        totalElements: transactions.length,
        pageSize: size,
        hasNext: page < totalPages - 1,
        hasPrevious: page > 0
      };
    } catch (error) {
      console.error('❌ Error getting pageable transactions:', error);
      throw error;
    }
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    try {
      const transactions = await apiClient.get<Transaction[]>(`/api/balance/transactions/type/${type}`);
      return transactions;
    } catch (error) {
      console.error('❌ Error getting transactions by type:', error);
      throw error;
    }
  }

  async createPulPalPayment(amount: number, description: string): Promise<PaymentResponse> {
    try {
      // Bu endpoint henüz backend'de yok, mock response döndürüyoruz
      console.log('🔄 PulPal payment request:', { amount, description });
      
      // Mock response
      return {
        paymentUrl: 'https://pulpal.az/payment/mock',
        success: true,
        message: 'Ödəmə URL\'i yaradıldı'
      };
    } catch (error) {
      console.error('❌ Error creating PulPal payment:', error);
      throw error;
    }
  }

  async createAzericardPayment(amount: number, description: string): Promise<PaymentResponse> {
    try {
      // Bu endpoint henüz backend'de yok, mock response döndürüyoruz
      console.log('🔄 Azericard payment request:', { amount, description });
      
      // Mock response
      return {
        paymentUrl: 'https://azericard.az/payment/mock',
        success: true,
        message: 'Ödəmə URL\'i yaradıldı'
      };
    } catch (error) {
      console.error('❌ Error creating Azericard payment:', error);
      throw error;
    }
  }

  async getCurrentBalance(): Promise<number> {
    try {
      const balanceResponse = await apiClient.get<{success: boolean, balance: number}>('/api/balance');
      return balanceResponse.balance || 0;
    } catch (error) {
      console.error('❌ Error getting current balance:', error);
      throw error;
    }
  }

  // useAuth hook'u için backward compatibility
  async getBalance(): Promise<number> {
    return this.getCurrentBalance();
  }
}

export const balanceService = new BalanceService();
export default balanceService; 
 
 
 
 
 
 
 