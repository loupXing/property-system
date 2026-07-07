import { Router } from 'express';
import { query, get, run } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const communities = await query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM buildings WHERE community_id = c.id) as building_count,
        (SELECT COUNT(*) FROM units u JOIN buildings b ON u.building_id = b.id WHERE b.community_id = c.id) as unit_count
      FROM communities c ORDER BY c.id DESC
    `);
    res.json(communities);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const community = await get('SELECT * FROM communities WHERE id = ?', [req.params.id]);
    if (!community) return res.status(404).json({ message: '小区不存在' });
    res.json(community);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, address, area, contact_phone, description } = req.body;
    if (!name || !address) return res.status(400).json({ message: '名称和地址不能为空' });
    const result = await run(
      'INSERT INTO communities (name, address, area, contact_phone, description) VALUES (?, ?, ?, ?, ?)',
      [name, address, area || null, contact_phone || null, description || null]
    );
    const community = await get('SELECT * FROM communities WHERE id = ?', [result.insertId]);
    res.status(201).json(community);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, address, area, contact_phone, description } = req.body;
    const existing = await get('SELECT id FROM communities WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: '小区不存在' });
    await run(
      'UPDATE communities SET name=?, address=?, area=?, contact_phone=?, description=? WHERE id=?',
      [name, address, area, contact_phone, description, req.params.id]
    );
    const community = await get('SELECT * FROM communities WHERE id = ?', [req.params.id]);
    res.json(community);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM communities WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: '小区不存在' });
    res.json({ message: '删除成功' });
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
