import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const communityCount = (db.prepare('SELECT COUNT(*) as count FROM communities').get() as { count: number }).count;
  const buildingCount = (db.prepare('SELECT COUNT(*) as count FROM buildings').get() as { count: number }).count;
  const unitCount = (db.prepare('SELECT COUNT(*) as count FROM units').get() as { count: number }).count;
  const residentCount = (db.prepare("SELECT COUNT(*) as count FROM residents WHERE status = '在住'").get() as { count: number }).count;
  const vacantUnits = (db.prepare("SELECT COUNT(*) as count FROM units WHERE status = '空置'").get() as { count: number }).count;
  const unpaidBills = (db.prepare("SELECT COUNT(*) as count FROM bills WHERE status = '未缴'").get() as { count: number }).count;
  const unpaidAmount = (db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE status = '未缴'").get() as { total: number }).total;
  const paidAmount = (db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE status = '已缴'").get() as { total: number }).total;
  const pendingRepairs = (db.prepare("SELECT COUNT(*) as count FROM repair_orders WHERE status IN ('待处理', '处理中')").get() as { count: number }).count;
  const parkingTotal = (db.prepare('SELECT COUNT(*) as count FROM parking_spaces').get() as { count: number }).count;
  const parkingOccupied = (db.prepare("SELECT COUNT(*) as count FROM parking_spaces WHERE status = '已租'").get() as { count: number }).count;

  const recentRepairs = db.prepare(`
    SELECT ro.*, u.unit_number FROM repair_orders ro
    LEFT JOIN units u ON ro.unit_id = u.id
    ORDER BY ro.id DESC LIMIT 5
  `).all();

  const recentBills = db.prepare(`
    SELECT bl.*, u.unit_number, ft.name as fee_type_name FROM bills bl
    JOIN units u ON bl.unit_id = u.id
    JOIN fee_types ft ON bl.fee_type_id = ft.id
    ORDER BY bl.id DESC LIMIT 5
  `).all();

  res.json({
    stats: {
      communityCount, buildingCount, unitCount, residentCount,
      vacantUnits, unpaidBills, unpaidAmount, paidAmount,
      pendingRepairs, parkingTotal, parkingOccupied,
    },
    recentRepairs,
    recentBills,
  });
});

export default router;
