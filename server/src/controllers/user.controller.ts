import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/index.js';
import { UserStatus } from '../types/index.js';

export class UserController {
  /**
   * List active executives/agents for assignment dropdowns
   */
  public static async getExecutives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeUsers = await UserModel.find({ status: UserStatus.ACTIVE }).sort({ name: 1 });
      const users = activeUsers.map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: (u.roles && u.roles[0]) || 'AGENT',
      }));

      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (err) {
      next(err);
    }
  }
}
