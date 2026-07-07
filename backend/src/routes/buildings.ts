import { Router } from 'express';
import { query, get, run } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { community_id } = req.query;
    const buildings = community_id
      ? await query(`
          SELECT b.*, c.name as community_name,
            (SELECT COUNT(*) FROM units WHERE building_id = b.id) as unit_count
          FROM buildings b JOIN communities c ON b.community_id = c.id
          WHERE b.community_id = ? ORDER BY b.id DESC
        `, [Number(community_id)])
      : await query(`
          SELECT b.*, c.name as community_name,
            (SELECT COUNT(*) FROM units WHERE building_id = b.id) as unit_count
          FROM buildings b JOIN communities c ON b.community_id = c.id
          ORDER BY b.id DESC
        `);
    res.json(buildings);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { community_id, name, floors, units_per_floor, description } = req.body;
    if (!community_id || !name) return res.status(400).json({ message: '小区和楼栋名称不能为空' });
    const result = await run(
      'INSERT INTO buildings (community_id, name, floors, units_per_floor, description) VALUES (?, ?, ?, ?, ?)',
      [community_id, name, floors || 1, units_per_floor || 1, description || null]
    );
    const building = await get('SELECT * FROM buildings WHERE id = ?', [result.insertId]);
    res.status(201).json(building);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, floors, units_per_floor, description } = req.body;
    const existing = await get('SELECT id FROM buildings WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: '楼栋不存在' });
    await run(
      'UPDATE buildings SET name=?, floors=?, units_per_floor=?, description=? WHERE id=?',
      [name, floors, units_per_floor, description, req.params.id]
    );
    const building = await get('SELECT * FROM buildings WHERE id = ?', [req.params.id]);
    res.json(building);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM buildings WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: '楼栋不存在' });
    res.json({ message: '删除成功' });
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
