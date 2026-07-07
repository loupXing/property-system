import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { building_id, status } = req.query;
  let sql = `
    SELECT u.*, b.name as building_name, c.name as community_name,
      (SELECT name FROM residents WHERE unit_id = u.id AND status = '在住' LIMIT 1) as resident_name
    FROM units u
    JOIN buildings b ON u.building_id = b.id
    JOIN communities c ON b.community_id = c.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  if (building_id) { sql += ' AND u.building_id = ?'; params.push(Number(building_id)); }
  if (status) { sql += ' AND u.status = ?'; params.push(String(status)); }
  sql += ' ORDER BY u.id DESC';
  const units = db.prepare(sql).all(...params);
  res.json(units);
});

router.post('/', (req, res) => {
  const { building_id, unit_number, floor, area, type, status } = req.body;
  if (!building_id || !unit_number || !area) {
    return res.status(400).json({ message: '楼栋、房号和面积不能为空' });
  }
  const result = db.prepare(
    'INSERT INTO units (building_id, unit_number, floor, area, type, status) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(building_id, unit_number, floor || 1, area, type || '住宅', status || '空置');
  const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(unit);
});

router.put('/:id', (req, res) => {
  const { unit_number, floor, area, type, status } = req.body;
  const existing = db.prepare('SELECT id FROM units WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: '房屋不存在' });
  db.prepare('UPDATE units SET unit_number=?, floor=?, area=?, type=?, status=? WHERE id=?')
    .run(unit_number, floor, area, type, status, req.params.id);
  const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(req.params.id);
  res.json(unit);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM units WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: '房屋不存在' });
  res.json({ message: '删除成功' });
});

export default router;
