import { useState, useEffect } from 'react';
import { payoutService } from '../../api/payoutService';
import type { PayoutRequest, Balance } from '../../api/payoutService';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';

const statusVariant = (status: string) => {
  if (status === 'approved') return 'green';
  if (status === 'rejected') return 'red';
  return 'yellow';
};

export default function InstructorPayoutsPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [bal, reqs] = await Promise.all([
        payoutService.getBalance(),
        payoutService.getMyRequests(),
      ]);
      setBalance(bal);
      setRequests(reqs);
    } catch {
      setError('Failed to load payout data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequestPayout = async () => {
    setRequesting(true);
    setError('');
    setSuccess('');
    try {
      await payoutService.requestPayout();
      setSuccess('Payout request submitted successfully');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request payout');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full"/>
    </div>
  );

  return (
    <div>
      <div className="mb-10">
        <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">Earnings</p>
        <h1 className="text-4xl font-bold text-slate-900">Payouts</h1>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">⚠️ {error}</div>}
      {success && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">✅ {success}</div>}

      {/* Balance Card */}
      <div className="bg-slate-900 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full -translate-y-16 translate-x-16"/>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full translate-y-12 -translate-x-8"/>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold">Available Balance</p>
            <p className="text-6xl font-bold text-white mt-2">
              ${balance?.balance.toFixed(2) ?? '0.00'}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {balance?.eligible_sessions ?? 0} session(s) eligible for payout
            </p>
          </div>
          <Button
            onClick={handleRequestPayout}
            loading={requesting}
            disabled={!balance || balance.balance <= 0}
            size="lg"
          >
            Request Payout
          </Button>
        </div>
      </div>

      {/* History */}
      <h2 className="text-lg font-bold text-slate-800 mb-4">Payout History</h2>
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-4xl mb-4">💰</p>
          <p className="text-slate-500">No payout requests yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="text-xl">💳</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-lg">${req.amount.toFixed(2)}</span>
                    <Badge label={req.status} variant={statusVariant(req.status)} />
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Requested {new Date(req.requested_at).toLocaleDateString()}
                    {req.resolved_at && ` · Resolved ${new Date(req.resolved_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}