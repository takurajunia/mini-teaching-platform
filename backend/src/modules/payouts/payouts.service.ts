import * as repo from './payouts.repository';
import { AppError } from '../../middleware/errorHandler';
import { log } from '../../utils/logger';

export const getBalance = async (instructorId: string) => {
  const balance = await repo.getVirtualBalance(instructorId);
  const sessions = await repo.getUnpaidCompletedSessions(instructorId);
  return { balance, eligible_sessions: sessions.length };
};

export const requestPayout = async (instructorId: string) => {
  const sessions = await repo.getUnpaidCompletedSessions(instructorId);
  if (sessions.length === 0)
    throw new AppError('No completed unpaid sessions available for payout', 400);

  const balance = await repo.getVirtualBalance(instructorId);
  if (balance <= 0)
    throw new AppError('No balance available for payout', 400);

  const payout = await repo.createPayoutRequest(
    instructorId,
    balance,
    sessions.map((s: any) => s.id)
  );

  log.info('Payout request created', {
    payoutId: payout.id,
    instructorId,
    amount: balance,
    sessionCount: sessions.length,
  });

  return payout;
};

export const getPayoutRequests = async (
  requesterId: string,
  requesterRole: string,
  filters: { instructorId?: string; status?: string }
) => {
  if (requesterRole === 'admin') {
    return repo.findAllPayouts(filters);
  }
  return repo.findPayoutsByInstructor(requesterId);
};

export const approvePayout = async (payoutId: string, adminId: string) => {
  const payout = await repo.findPayoutById(payoutId);
  if (!payout) throw new AppError('Payout request not found', 404);
  if (payout.status !== 'pending')
    throw new AppError(`Cannot approve a ${payout.status} request`, 400);

  const approved = await repo.approvePayoutRequest(payoutId, adminId);

  log.info('Payout request approved', {
    payoutId,
    adminId,
    amount: approved.amount,
    instructorId: approved.instructor_id,
  });

  return approved;
};

export const rejectPayout = async (payoutId: string, adminId: string) => {
  const payout = await repo.findPayoutById(payoutId);
  if (!payout) throw new AppError('Payout request not found', 404);
  if (payout.status !== 'pending')
    throw new AppError(`Cannot reject a ${payout.status} request`, 400);

  const rejected = await repo.rejectPayoutRequest(payoutId, adminId);

  log.info('Payout request rejected', {
    payoutId,
    adminId,
    instructorId: rejected.instructor_id,
  });

  return rejected;
};