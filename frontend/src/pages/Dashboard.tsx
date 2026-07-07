import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin } from 'antd';
import {
  HomeOutlined, BankOutlined, AppstoreOutlined, TeamOutlined,
  DollarOutlined, ToolOutlined, CarOutlined,
} from '@ant-design/icons';
import api from '../api';

interface DashboardData {
  stats: {
    communityCount: number;
    buildingCount: number;
    unitCount: number;
    residentCount: number;
    vacantUnits: number;
    unpaidBills: number;
    unpaidAmount: number;
    paidAmount: number;
    pendingRepairs: number;
    parkingTotal: number;
    parkingOccupied: number;
  };
  recentRepairs: Array<{ id: number; title: string; status: string; unit_number: string; created_at: string }>;
  recentBills: Array<{ id: number; unit_number: string; fee_type_name: string; amount: number; status: string; period: string }>;
}

const statusColors: Record<string, string> = {
  '待处理': 'orange', '处理中': 'blue', '已完成': 'green',
  '未缴': 'red', '已缴': 'green',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const { stats } = data;
  const statCards = [
    { title: '管理小区', value: stats.communityCount, icon: <HomeOutlined />, color: '#4f46e5' },
    { title: '楼栋总数', value: stats.buildingCount, icon: <BankOutlined />, color: '#0891b2' },
    { title: '房屋总数', value: stats.unitCount, icon: <AppstoreOutlined />, color: '#059669' },
    { title: '在住住户', value: stats.residentCount, icon: <TeamOutlined />, color: '#d97706' },
    { title: '空置房屋', value: stats.vacantUnits, icon: <AppstoreOutlined />, color: '#6b7280' },
    { title: '待缴账单', value: stats.unpaidBills, icon: <DollarOutlined />, color: '#dc2626' },
    { title: '待处理工单', value: stats.pendingRepairs, icon: <ToolOutlined />, color: '#ea580c' },
    { title: '车位使用率', value: stats.parkingTotal ? `${Math.round(stats.parkingOccupied / stats.parkingTotal * 100)}%` : '0%', icon: <CarOutlined />, color: '#7c3aed' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>工作台</h2>
        <p>物业运营数据概览</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((s) => (
          <Col xs={12} sm={8} md={6} key={s.title}>
            <Card className="stat-card" hoverable>
              <Statistic
                title={s.title}
                value={s.value}
                prefix={<span style={{ color: s.color, marginRight: 8 }}>{s.icon}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="费用概览">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="已收费用 (元)" value={stats.paidAmount} precision={2} valueStyle={{ color: '#059669' }} />
              </Col>
              <Col span={12}>
                <Statistic title="待收费用 (元)" value={stats.unpaidAmount} precision={2} valueStyle={{ color: '#dc2626' }} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="车位概览">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="车位总数" value={stats.parkingTotal} />
              </Col>
              <Col span={12}>
                <Statistic title="已租车位" value={stats.parkingOccupied} valueStyle={{ color: '#4f46e5' }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="最近报修">
            <Table
              dataSource={data.recentRepairs}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '标题', dataIndex: 'title', ellipsis: true },
                { title: '房号', dataIndex: 'unit_number', width: 80 },
                { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近账单">
            <Table
              dataSource={data.recentBills}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '房号', dataIndex: 'unit_number', width: 80 },
                { title: '费用类型', dataIndex: 'fee_type_name' },
                { title: '金额', dataIndex: 'amount', width: 80, render: (v: number) => `¥${v}` },
                { title: '状态', dataIndex: 'status', width: 70, render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
