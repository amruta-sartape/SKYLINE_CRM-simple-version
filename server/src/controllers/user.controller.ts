import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database.js';

export class UserController {
  /**
   * List active executives/agents for assignment dropdowns
   */
  public static async getExecutives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sql = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          r.name as role
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.status = 'ACTIVE'
        ORDER BY u.name ASC
      `;

      const users = await db.all(sql);
      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (err) {
      next(err);
    }
  }
}
