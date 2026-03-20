import { Request, Response, NextFunction } from 'express';
import * as payoutsService from './payouts.service';
import { sendSuccess } from '../../utils/response';

type PayoutIdParams = {
  id: string;
};

export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructorId = (req as any).user.id;
    const balance = await payoutsService.getBalance(instructorId);
    sendSuccess(res, balance);
  } catch (err) { next(err); }
};

export const requestPayout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructorId = (req as any).user.id;
    const payout = await payoutsService.requestPayout(instructorId);
    sendSuccess(res, payout, 201, 'Payout request submitted');
  } catch (err) { next(err); }
};

export const getPayoutRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { instructorId, status } = req.query as {
      instructorId?: string;
      status?: string;
    };
    const payouts = await payoutsService.getPayoutRequests(
      user.id,
      user.role,
      { instructorId, status }
    );
    sendSuccess(res, payouts);
  } catch (err) { next(err); }
};

export const approvePayout = async (req: Request<PayoutIdParams>, res: Response, next: NextFunction) => {
  try {
    const adminId = (req as any).user.id;
    const payout = await payoutsService.approvePayout(req.params.id, adminId);
    sendSuccess(res, payout, 200, 'Payout request approved');
  } catch (err) { next(err); }
};

export const rejectPayout = async (req: Request<PayoutIdParams>, res: Response, next: NextFunction) => {
  try {
    const adminId = (req as any).user.id;
    const payout = await payoutsService.rejectPayout(req.params.id, adminId);
    sendSuccess(res, payout, 200, 'Payout request rejected');
  } catch (err) { next(err); }
};