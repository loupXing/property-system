import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const communities = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM buildings WHERE community_id = c.id) as building_count,
      (SELECT COUNT(*) FROM units u JOIN buildings b ON u.building_id = b.id WHERE b.community_id = c.id) as unit_count
    FROM communities c ORDER BY c.id DESC
  `).all();
  res.json(communities);
});

router.get('/:id', (req, res) => {
  const community = db.prepare('SELECT * FROM communities WHERE id = ?').get(req.params.id);
  if (!community) return res.status(404).json({ message: '小区不存在' });
  res.json(community);
});

router.post('/', (req, res) => {
  const { name, address, area, contact_phone, description } = req.body;
  if (!name || !address) return res.status(400).json({ message: '名称和地址不能为空' });
  const result = db.prepare(
    'INSERT INTO communities (name, address, area, contact_phone, description) VALUES (?, ?, ?, ?, ?)'
  ).run(name, address, area || null, contact_phone || null, description || null);
  const community = db.prepare('SELECT * FROM communities WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(community);
});

router.put('/:id', (req, res) => {
  const { name, address, area, contact_phone, description } = req.body;
  const existing = db.prepare('SELECT id FROM communities WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: '小区不存在' });
  db.prepare(
    'UPDATE communities SET name=?, address=?, area=?, contact_phone=?, description=? WHERE id=?'
  ).run(name, address, area, contact_phone, description, req.params.id);
  const community = db.prepare('SELECT * FROM communities WHERE id = ?').get(req.params.id);
  res.json(community);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM communities WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: '小区不存在' });
  res.json({ message: '删除成功' });
});

export default router;
