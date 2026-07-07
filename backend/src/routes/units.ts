import { Router } from 'express';
import { query, get, run } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
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
    const units = await query(sql, params);
    res.json(units);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { building_id, unit_number, floor, area, type, status } = req.body;
    if (!building_id || !unit_number || !area) {
      return res.status(400).json({ message: '楼栋、房号和面积不能为空' });
    }
    const result = await run(
      'INSERT INTO units (building_id, unit_number, floor, area, type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [building_id, unit_number, floor || 1, area, type || '住宅', status || '空置']
    );
    const unit = await get('SELECT * FROM units WHERE id = ?', [result.insertId]);
    res.status(201).json(unit);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { unit_number, floor, area, type, status } = req.body;
    const existing = await get('SELECT id FROM units WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: '房屋不存在' });
    await run(
      'UPDATE units SET unit_number=?, floor=?, area=?, type=?, status=? WHERE id=?',
      [unit_number, floor, area, type, status, req.params.id]
    );
    const unit = await get('SELECT * FROM units WHERE id = ?', [req.params.id]);
    res.json(unit);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM units WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: '房屋不存在' });
    res.json({ message: '删除成功' });
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
