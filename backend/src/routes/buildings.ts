import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { community_id } = req.query;
  let buildings;
  if (community_id) {
    buildings = db.prepare(`
      SELECT b.*, c.name as community_name,
        (SELECT COUNT(*) FROM units WHERE building_id = b.id) as unit_count
      FROM buildings b JOIN communities c ON b.community_id = c.id
      WHERE b.community_id = ? ORDER BY b.id DESC
    `).all(community_id);
  } else {
    buildings = db.prepare(`
      SELECT b.*, c.name as community_name,
        (SELECT COUNT(*) FROM units WHERE building_id = b.id) as unit_count
      FROM buildings b JOIN communities c ON b.community_id = c.id
      ORDER BY b.id DESC
    `).all();
  }
  res.json(buildings);
});

router.post('/', (req, res) => {
  const { community_id, name, floors, units_per_floor, description } = req.body;
  if (!community_id || !name) return res.status(400).json({ message: '小区和楼栋名称不能为空' });
  const result = db.prepare(
    'INSERT INTO buildings (community_id, name, floors, units_per_floor, description) VALUES (?, ?, ?, ?, ?)'
  ).run(community_id, name, floors || 1, units_per_floor || 1, description || null);
  const building = db.prepare('SELECT * FROM buildings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(building);
});

router.put('/:id', (req, res) => {
  const { name, floors, units_per_floor, description } = req.body;
  const existing = db.prepare('SELECT id FROM buildings WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: '楼栋不存在' });
  db.prepare('UPDATE buildings SET name=?, floors=?, units_per_floor=?, description=? WHERE id=?')
    .run(name, floors, units_per_floor, description, req.params.id);
  const building = db.prepare('SELECT * FROM buildings WHERE id = ?').get(req.params.id);
  res.json(building);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM buildings WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: '楼栋不存在' });
  res.json({ message: '删除成功' });
});

export default router;
