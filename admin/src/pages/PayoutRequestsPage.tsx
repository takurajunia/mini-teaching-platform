import { useState, useEffect } from 'react';
import { payoutService } from '../api/payoutService';
import type { PayoutRequest } from '../api/payoutService';
import Badge from '../components/Badge';
import Button from '../components/Button';

const statusVariant = (status: string) => {
  if (status === 'approved') return 'green';
  if (status === 'rejected') return 'red';
  return 'yellow';
};

export default function PayoutRequestsPage() {
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await payoutService.getAll(
        statusFilter ? { status: statusFilter } : undefined
      );
      setRequests(data);
    } catch {
      setError('Failed to load payout requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    setError('');
    setSuccess('');
    try {
      const updated = await payoutService.approve(id);
      setRequests((prev) => prev.map((r) => r.id === id ? updated : r));
      setSuccess('Payout approved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve payout');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    setError('');
    setSuccess('');
    try {
      const updated = await payoutService.reject(id);
      setRequests((prev) => prev.map((r) => r.id === id ? updated : r));
      setSuccess('Payout rejected');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject payout');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payout Requests</h1>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          {success}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No payout requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Instructor</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Amount</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Requested</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Resolved</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700 font-mono text-xs">
                    {req.instructor_id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    ${req.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={req.status} variant={statusVariant(req.status)} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(req.requested_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {req.resolved_at
                      ? new Date(req.resolved_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          loading={actionLoading === req.id}
                          onClick={() => handleApprove(req.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          loading={actionLoading === req.id}
                          onClick={() => handleReject(req.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}