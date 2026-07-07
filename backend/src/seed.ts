import bcrypt from 'bcryptjs';
import db, { initDatabase } from './db.js';

initDatabase();

const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
if (userCount > 0) {
  console.log('数据库已有数据，跳过初始化');
  process.exit(0);
}

console.log('正在初始化示例数据...');

const password = bcrypt.hashSync('admin123', 10);
db.prepare('INSERT INTO users (username, password, name, role, phone) VALUES (?, ?, ?, ?, ?)')
  .run('admin', password, '系统管理员', 'admin', '13800000000');

const community1 = db.prepare(
  'INSERT INTO communities (name, address, area, contact_phone, description) VALUES (?, ?, ?, ?, ?)'
).run('阳光花园', '北京市朝阳区阳光路88号', 120000, '010-88888888', '高端住宅小区，绿化率40%');

const community2 = db.prepare(
  'INSERT INTO communities (name, address, area, contact_phone, description) VALUES (?, ?, ?, ?, ?)'
).run('翠湖名苑', '北京市海淀区翠湖路66号', 85000, '010-66666666', '毗邻翠湖公园，环境优美');

const c1Id = community1.lastInsertRowid;
const c2Id = community2.lastInsertRowid;

const buildings = [
  { community_id: c1Id, name: '1号楼', floors: 18, units_per_floor: 4 },
  { community_id: c1Id, name: '2号楼', floors: 18, units_per_floor: 4 },
  { community_id: c1Id, name: '3号楼', floors: 12, units_per_floor: 6 },
  { community_id: c2Id, name: 'A栋', floors: 20, units_per_floor: 4 },
  { community_id: c2Id, name: 'B栋', floors: 20, units_per_floor: 4 },
];

const buildingIds: number[] = [];
for (const b of buildings) {
  const result = db.prepare(
    'INSERT INTO buildings (community_id, name, floors, units_per_floor) VALUES (?, ?, ?, ?)'
  ).run(b.community_id, b.name, b.floors, b.units_per_floor);
  buildingIds.push(Number(result.lastInsertRowid));
}

const unitTypes = ['住宅', '住宅', '住宅', '商铺'];
const unitStatuses = ['已入住', '已入住', '空置', '已入住'];
const unitIds: number[] = [];

for (let bi = 0; bi < buildingIds.length; bi++) {
  const b = buildings[bi];
  for (let f = 1; f <= Math.min(b.floors, 5); f++) {
    for (let u = 1; u <= b.units_per_floor; u++) {
      const unitNumber = `${f}${String(u).padStart(2, '0')}`;
      const area = 80 + Math.floor(Math.random() * 60);
      const type = unitTypes[(f + u) % unitTypes.length];
      const status = unitStatuses[(f + u) % unitStatuses.length];
      const result = db.prepare(
        'INSERT INTO units (building_id, unit_number, floor, area, type, status) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(buildingIds[bi], unitNumber, f, area, type, status);
      unitIds.push(Number(result.lastInsertRowid));
    }
  }
}

const residentNames = ['张伟', '李娜', '王强', '刘洋', '陈静', '赵明', '孙丽', '周杰', '吴芳', '郑浩'];
const residentPhones = ['13812345678', '13923456789', '13734567890', '13645678901', '13556789012',
  '13467890123', '13378901234', '13289012345', '13190123456', '13001234567'];

for (let i = 0; i < 10; i++) {
  const unitId = unitIds[i * 3];
  db.prepare(
    'INSERT INTO residents (unit_id, name, phone, id_card, type, move_in_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(unitId, residentNames[i], residentPhones[i],
    `110101199${String(i).padStart(2, '0')}01011234`, i % 3 === 0 ? '业主' : '租户',
    '2023-06-01', '在住');
}

const feeTypes = [
  { name: '物业管理费', unit_price: 2.5, unit: '元/㎡/月', description: '按建筑面积收取' },
  { name: '停车费', unit_price: 300, unit: '元/月', description: '地下车位月租' },
  { name: '垃圾清运费', unit_price: 20, unit: '元/月', description: '生活垃圾清运' },
  { name: '公共维修基金', unit_price: 0.5, unit: '元/㎡/月', description: '公共设施维护' },
];

const feeTypeIds: number[] = [];
for (const ft of feeTypes) {
  const result = db.prepare(
    'INSERT INTO fee_types (name, unit_price, unit, description) VALUES (?, ?, ?, ?)'
  ).run(ft.name, ft.unit_price, ft.unit, ft.description);
  feeTypeIds.push(Number(result.lastInsertRowid));
}

const periods = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];
for (let i = 0; i < 20; i++) {
  const unitId = unitIds[i];
  const feeTypeId = feeTypeIds[i % feeTypeIds.length];
  const unit = db.prepare('SELECT area FROM units WHERE id = ?').get(unitId) as { area: number };
  const amount = feeTypeId === feeTypeIds[0]
    ? Math.round(unit.area * 2.5 * 100) / 100
    : feeTypes[i % feeTypes.length].unit_price;
  const status = i % 3 === 0 ? '未缴' : '已缴';
  const paidAt = status === '已缴' ? '2026-01-15 10:00:00' : null;
  db.prepare(
    'INSERT INTO bills (unit_id, fee_type_id, amount, period, status, due_date, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(unitId, feeTypeId, amount, periods[i % periods.length], status, '2026-01-31', paidAt);
}

const repairCategories = ['水电', '门窗', '电梯', '管道', '其他'];
const repairTitles = ['厨房水管漏水', '卧室窗户关不严', '电梯按键失灵', '卫生间下水道堵塞', '客厅灯不亮',
  '空调制冷效果差', '门锁损坏', '阳台护栏松动'];
const repairStatuses = ['待处理', '处理中', '已完成', '已完成', '待处理', '处理中', '已完成', '待处理'];

for (let i = 0; i < 8; i++) {
  const completedAt = repairStatuses[i] === '已完成' ? '2026-01-20 15:00:00' : null;
  db.prepare(
    'INSERT INTO repair_orders (unit_id, resident_id, title, description, category, priority, status, handler, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(unitIds[i], i + 1, repairTitles[i], `住户报修：${repairTitles[i]}，请尽快处理。`,
    repairCategories[i % repairCategories.length], i < 2 ? '紧急' : '普通',
    repairStatuses[i], repairStatuses[i] !== '待处理' ? '李师傅' : null, completedAt);
}

const announcements = [
  { title: '关于春节期间物业服务安排的通知', content: '尊敬的业主：春节期间（2月10日-2月17日）物业服务中心正常值班，值班电话：010-88888888。祝大家新春快乐！', type: '通知', is_pinned: 1 },
  { title: '小区绿化改造工程公告', content: '为提升小区环境品质，计划于3月1日起对中心花园进行绿化改造，工期约15天，施工期间请注意安全。', type: '公告', is_pinned: 0 },
  { title: '2026年第一季度物业费缴纳提醒', content: '请各位业主于2026年1月31日前缴纳第一季度物业费，可通过物业前台或线上渠道缴费。逾期未缴将产生滞纳金。', type: '通知', is_pinned: 1 },
  { title: '电梯年度检修通知', content: '根据特种设备安全管理规定，本小区所有电梯将于2月15日-2月16日进行年度检修，检修期间电梯暂停使用，请业主提前做好准备。', type: '公告', is_pinned: 0 },
];

for (const a of announcements) {
  db.prepare(
    'INSERT INTO announcements (title, content, type, author, is_pinned) VALUES (?, ?, ?, ?, ?)'
  ).run(a.title, a.content, a.type, '物业管理处', a.is_pinned);
}

for (let i = 1; i <= 30; i++) {
  const communityId = i <= 15 ? c1Id : c2Id;
  const status = i % 4 === 0 ? '空闲' : '已租';
  const unitId = status === '已租' ? unitIds[i % unitIds.length] : null;
  db.prepare(
    'INSERT INTO parking_spaces (community_id, space_number, type, status, unit_id, monthly_fee) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(communityId, `${i <= 15 ? 'A' : 'B'}-${String(i % 15 + 1).padStart(3, '0')}`,
    i % 3 === 0 ? '地下' : '地上', status, unitId, i % 3 === 0 ? 500 : 300);
}

console.log('示例数据初始化完成！');
console.log('默认账号: admin / admin123');
