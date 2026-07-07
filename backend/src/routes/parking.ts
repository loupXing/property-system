import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { community_id, status } = req.query;
  let sql = `
    SELECT p.*, c.name as community_name, u.unit_number
    FROM parking_spaces p
    JOIN communities c ON p.community_id = c.id
    LEFT JOIN units u ON p.unit_id = u.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  if (community_id) { sql += ' AND p.community_id = ?'; params.push(Number(community_id)); }
  if (status) { sql += ' AND p.status = ?'; params.push(String(status)); }
  sql += ' ORDER BY p.id DESC';
  const spaces = db.prepare(sql).all(...params);
  res.json(spaces);
});

router.post('/', (req, res) => {
  const { community_id, space_number, type, status, unit_id, monthly_fee } = req.body;
  if (!community_id || !space_number) return res.status(400).json({ message: '小区和车位号不能为空' });
  const result = db.prepare(
    'INSERT INTO parking_spaces (community_id, space_number, type, status, unit_id, monthly_fee) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(community_id, space_number, type || '地上', status || '空闲', unit_id || null, monthly_fee || 0);
  const space = db.prepare('SELECT * FROM parking_spaces WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(space);
});

router.put('/:id', (req, res) => {
  const { space_number, type, status, unit_id, monthly_fee } = req.body;
  const existing = db.prepare('SELECT id FROM parking_spaces WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: '车位不存在' });
  db.prepare('UPDATE parking_spaces SET space_number=?, type=?, status=?, unit_id=?, monthly_fee=? WHERE id=?')
    .run(space_number, type, status, unit_id, monthly_fee, req.params.id);
  const space = db.prepare('SELECT * FROM parking_spaces WHERE id = ?').get(req.params.id);
  res.json(space);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM parking_spaces WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: '车位不存在' });
  res.json({ message: '删除成功' });
});

export default router;
