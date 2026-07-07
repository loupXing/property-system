import { Router } from 'express';
import { query, get } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const communityCount = (await get<{ count: number }>('SELECT COUNT(*) as count FROM communities'))!.count;
    const buildingCount = (await get<{ count: number }>('SELECT COUNT(*) as count FROM buildings'))!.count;
    const unitCount = (await get<{ count: number }>('SELECT COUNT(*) as count FROM units'))!.count;
    const residentCount = (await get<{ count: number }>("SELECT COUNT(*) as count FROM residents WHERE status = '在住'"))!.count;
    const vacantUnits = (await get<{ count: number }>("SELECT COUNT(*) as count FROM units WHERE status = '空置'"))!.count;
    const unpaidBills = (await get<{ count: number }>("SELECT COUNT(*) as count FROM bills WHERE status = '未缴'"))!.count;
    const unpaidAmount = (await get<{ total: number }>("SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE status = '未缴'"))!.total;
    const paidAmount = (await get<{ total: number }>("SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE status = '已缴'"))!.total;
    const pendingRepairs = (await get<{ count: number }>("SELECT COUNT(*) as count FROM repair_orders WHERE status IN ('待处理', '处理中')"))!.count;
    const parkingTotal = (await get<{ count: number }>('SELECT COUNT(*) as count FROM parking_spaces'))!.count;
    const parkingOccupied = (await get<{ count: number }>("SELECT COUNT(*) as count FROM parking_spaces WHERE status = '已租'"))!.count;

    const recentRepairs = await query(`
      SELECT ro.*, u.unit_number FROM repair_orders ro
      LEFT JOIN units u ON ro.unit_id = u.id
      ORDER BY ro.id DESC LIMIT 5
    `);

    const recentBills = await query(`
      SELECT bl.*, u.unit_number, ft.name as fee_type_name FROM bills bl
      JOIN units u ON bl.unit_id = u.id
      JOIN fee_types ft ON bl.fee_type_id = ft.id
      ORDER BY bl.id DESC LIMIT 5
    `);

    res.json({
      stats: {
        communityCount, buildingCount, unitCount, residentCount,
        vacantUnits, unpaidBills, unpaidAmount, paidAmount,
        pendingRepairs, parkingTotal, parkingOccupied,
      },
      recentRepairs,
      recentBills,
    });
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
