import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { status, category } = req.query;
  let sql = `
    SELECT ro.*, u.unit_number, b.name as building_name, c.name as community_name, r.name as resident_name
    FROM repair_orders ro
    LEFT JOIN units u ON ro.unit_id = u.id
    LEFT JOIN buildings b ON u.building_id = b.id
    LEFT JOIN communities c ON b.community_id = c.id
    LEFT JOIN residents r ON ro.resident_id = r.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  if (status) { sql += ' AND ro.status = ?'; params.push(String(status)); }
  if (category) { sql += ' AND ro.category = ?'; params.push(String(category)); }
  sql += ' ORDER BY ro.id DESC';
  const orders = db.prepare(sql).all(...params);
  res.json(orders);
});

router.post('/', (req, res) => {
  const { unit_id, resident_id, title, description, category, priority } = req.body;
  if (!title) return res.status(400).json({ message: '标题不能为空' });
  const result = db.prepare(
    'INSERT INTO repair_orders (unit_id, resident_id, title, description, category, priority) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(unit_id || null, resident_id || null, title, description || null, category || '其他', priority || '普通');
  const order = db.prepare('SELECT * FROM repair_orders WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(order);
});

router.put('/:id', (req, res) => {
  const { status, handler, result: repairResult } = req.body;
  const existing = db.prepare('SELECT id FROM repair_orders WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: '工单不存在' });
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
  const completedAt = status === '已完成' ? now : null;
  db.prepare('UPDATE repair_orders SET status=?, handler=?, result=?, completed_at=? WHERE id=?')
    .run(status, handler, repairResult, completedAt, req.params.id);
  const order = db.prepare('SELECT * FROM repair_orders WHERE id = ?').get(req.params.id);
  res.json(order);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM repair_orders WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: '工单不存在' });
  res.json({ message: '删除成功' });
});

export default router;
