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

type PayoutRequestApi = Omit<PayoutRequest, 'amount'> & {
  amount: number | string;
};

const normalizePayoutRequest = (req: PayoutRequestApi): PayoutRequest => {
  const amount = Number(req.amount);
  return {
    ...req,
    amount: Number.isFinite(amount) ? amount : 0,
  };
};

export const payoutService = {
  getAll: async (filters?: { instructorId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.instructorId) params.append('instructorId', filters.instructorId);
    if (filters?.status) params.append('status', filters.status);
    const res = await apiClient.get<{ data: PayoutRequestApi[] }>(
      `/payouts/requests?${params.toString()}`
    );
    return res.data.data.map(normalizePayoutRequest);
  },

  approve: async (id: string) => {
    const res = await apiClient.post<{ data: PayoutRequestApi }>(
      `/payouts/requests/${id}/approve`
    );
    return normalizePayoutRequest(res.data.data);
  },

  reject: async (id: string) => {
    const res = await apiClient.post<{ data: PayoutRequestApi }>(
      `/payouts/requests/${id}/reject`
    );
    return normalizePayoutRequest(res.data.data);
  },
};