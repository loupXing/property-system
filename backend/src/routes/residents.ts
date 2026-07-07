import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { unit_id, status } = req.query;
  let sql = `
    SELECT r.*, u.unit_number, b.name as building_name, c.name as community_name
    FROM residents r
    LEFT JOIN units u ON r.unit_id = u.id
    LEFT JOIN buildings b ON u.building_id = b.id
    LEFT JOIN communities c ON b.community_id = c.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  if (unit_id) { sql += ' AND r.unit_id = ?'; params.push(Number(unit_id)); }
  if (status) { sql += ' AND r.status = ?'; params.push(String(status)); }
  sql += ' ORDER BY r.id DESC';
  const residents = db.prepare(sql).all(...params);
  res.json(residents);
});

router.post('/', (req, res) => {
  const { unit_id, name, phone, id_card, type, move_in_date, status } = req.body;
  if (!name || !phone) return res.status(400).json({ message: '姓名和电话不能为空' });
  const result = db.prepare(
    'INSERT INTO residents (unit_id, name, phone, id_card, type, move_in_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(unit_id || null, name, phone, id_card || null, type || '业主', move_in_date || null, status || '在住');
  if (unit_id) {
    db.prepare("UPDATE units SET status = '已入住' WHERE id = ?").run(unit_id);
  }
  const resident = db.prepare('SELECT * FROM residents WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(resident);
});

router.put('/:id', (req, res) => {
  const { unit_id, name, phone, id_card, type, move_in_date, status } = req.body;
  const existing = db.prepare('SELECT id FROM residents WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: '住户不存在' });
  db.prepare('UPDATE residents SET unit_id=?, name=?, phone=?, id_card=?, type=?, move_in_date=?, status=? WHERE id=?')
    .run(unit_id, name, phone, id_card, type, move_in_date, status, req.params.id);
  const resident = db.prepare('SELECT * FROM residents WHERE id = ?').get(req.params.id);
  res.json(resident);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM residents WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: '住户不存在' });
  res.json({ message: '删除成功' });
});

export default router;
