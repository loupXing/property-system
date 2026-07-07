import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/types', (_req, res) => {
  const types = db.prepare('SELECT * FROM fee_types ORDER BY id').all();
  res.json(types);
});

router.post('/types', (req, res) => {
  const { name, unit_price, unit, description } = req.body;
  if (!name || unit_price === undefined) return res.status(400).json({ message: '名称和单价不能为空' });
  const result = db.prepare(
    'INSERT INTO fee_types (name, unit_price, unit, description) VALUES (?, ?, ?, ?)'
  ).run(name, unit_price, unit || '元/月', description || null);
  const feeType = db.prepare('SELECT * FROM fee_types WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(feeType);
});

router.get('/bills', (req, res) => {
  const { status, unit_id } = req.query;
  let sql = `
    SELECT bl.*, u.unit_number, b.name as building_name, c.name as community_name, ft.name as fee_type_name
    FROM bills bl
    JOIN units u ON bl.unit_id = u.id
    JOIN buildings b ON u.building_id = b.id
    JOIN communities c ON b.community_id = c.id
    JOIN fee_types ft ON bl.fee_type_id = ft.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  if (status) { sql += ' AND bl.status = ?'; params.push(String(status)); }
  if (unit_id) { sql += ' AND bl.unit_id = ?'; params.push(Number(unit_id)); }
  sql += ' ORDER BY bl.id DESC';
  const bills = db.prepare(sql).all(...params);
  res.json(bills);
});

router.post('/bills', (req, res) => {
  const { unit_id, fee_type_id, amount, period, due_date } = req.body;
  if (!unit_id || !fee_type_id || !amount || !period) {
    return res.status(400).json({ message: '房屋、费用类型、金额和账期不能为空' });
  }
  const result = db.prepare(
    'INSERT INTO bills (unit_id, fee_type_id, amount, period, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(unit_id, fee_type_id, amount, period, due_date || null);
  const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(bill);
});

router.post('/bills/:id/pay', (req, res) => {
  const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(req.params.id) as { id: number; status: string } | undefined;
  if (!bill) return res.status(404).json({ message: '账单不存在' });
  if (bill.status === '已缴') return res.status(400).json({ message: '账单已缴纳' });
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
  db.prepare("UPDATE bills SET status = '已缴', paid_at = ? WHERE id = ?").run(now, req.params.id);
  const updated = db.prepare('SELECT * FROM bills WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/bills/:id', (req, res) => {
  const result = db.prepare('DELETE FROM bills WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: '账单不存在' });
  res.json({ message: '删除成功' });
});

export default router;
