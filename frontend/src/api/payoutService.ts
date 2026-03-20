import apiClient from './client';

export interface PayoutRequest {
  id: string;
  instructor_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface Balance {
  balance: number;
  eligible_sessions: number;
}

export const payoutService = {
  getBalance: async () => {
    const res = await apiClient.get<{ data: Balance }>('/payouts/balance');
     return {
       ...res.data.data,
       balance: Number(res.data.data.balance),
     };
  },

  requestPayout: async () => {
    const res = await apiClient.post<{ data: PayoutRequest }>('/payouts/requests');
     return {
       ...res.data.data,
       amount: Number(res.data.data.amount),
     };
  },

  getMyRequests: async () => {
    const res = await apiClient.get<{ data: PayoutRequest[] }>('/payouts/requests');
     return res.data.data.map(req => ({
       ...req,
       amount: Number(req.amount),
     }));
  },
};