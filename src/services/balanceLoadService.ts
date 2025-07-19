import { apiClient } from './api';

export interface PaymentMethod {
  id: number;
  methodName: string;
  methodType: string;
  cardNumber: string;
  cardHolderName: string;
  bankName: string;
  accountNumber?: string;
  accountHolderName?: string;
  pulpalMerchantId?: string;
  cryptoWalletAddress?: string;
  cryptoType?: string;
  description?: string;
  isActive: boolean;
  showFullCardNumber?: boolean;
  createdAt: string;
  updatedAt?: string;
  displayCardNumber?: string;
}

export interface BalanceRequest {
  id: number;
  userId: number;
  username: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  receiptImagePath?: string;
  adminNotes?: string;
  approvedById?: number;
  approvedByUsername?: string;
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;
}

class BalanceLoadService {
  // Get available payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>('/api/balance-requests/payment-methods');
  }

  // Submit balance load request with file
  async submitBalanceRequest(
    amount: number,
    paymentMethodId: number,
    receiptFile: File
  ): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('amount', amount.toString());
    formData.append('paymentMethodId', paymentMethodId.toString());
    formData.append('receiptImage', receiptFile);

    const token = localStorage.getItem('authToken');
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:1111' 
      : 'https://digex-backend-h4ybp.ondigitalocean.app';
    const response = await fetch(`${baseUrl}/api/balance-requests/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return await response.json();
  }

  // Submit balance load request with Cloudinary URL
  async submitBalanceRequestWithCloudinary(
    amount: number,
    paymentMethodId: number,
    receiptImageUrl: string,
    receiptPublicId: string
  ): Promise<{ message: string }> {
    const requestData = {
      amount: amount,
      paymentMethodId: paymentMethodId,
      receiptUrl: receiptImageUrl // Backend 'receiptUrl' bekliyor
    };

    const token = localStorage.getItem('authToken');
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:1111' 
      : 'https://digex-backend-h4ybp.ondigitalocean.app';
    const response = await fetch(`${baseUrl}/api/balance-requests/create-cloudinary`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return await response.json();
  }

  // Get user's balance requests
  async getUserBalanceRequests(): Promise<BalanceRequest[]> {
    return apiClient.get<BalanceRequest[]>('/api/balance-requests/user-requests');
  }

  // Get user's recent balance requests
  async getRecentBalanceRequests(): Promise<BalanceRequest[]> {
    return apiClient.get<BalanceRequest[]>('/api/balance-requests/user-requests/recent');
  }
}

export default new BalanceLoadService(); 