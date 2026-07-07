import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';

interface ParkingSpace {
  id: number;
  community_id: number;
  community_name: string;
  space_number: string;
  type: string;
  status: string;
  unit_id: number;
  unit_number: string;
  monthly_fee: number;
}

interface Community { id: number; name: string; }
interface Unit { id: number; unit_number: string; building_name: string; community_name: string; }

const statusColors: Record<string, string> = { '空闲': 'default', '已租': 'green', '已售': 'blue' };

export default function Parking() {
  const [data, setData] = useState<ParkingSpace[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ParkingSpace | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    const params = filterStatus ? { status: filterStatus } : {};
    api.get('/parking', { params }).then(res => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    api.get('/communities').then(res => setCommunities(res.data));
    api.get('/units').then(res => setUnits(res.data));
  }, [filterStatus]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.put(`/parking/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/parking', values);
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchData();
    } catch {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: '小区', dataIndex: 'community_name', key: 'community_name' },
    { title: '车位号', dataIndex: 'space_number', key: 'space_number' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
    { title: '绑定房号', dataIndex: 'unit_number', key: 'unit_number', render: (v: string) => v || '-' },
    { title: '月租(元)', dataIndex: 'monthly_fee', key: 'monthly_fee', render: (v: number) => v ? `¥${v}` : '-' },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: ParkingSpace) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={async () => { await api.delete(`/parking/${record.id}`); message.success('删除成功'); fetchData(); }}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h2>车位管理</h2><p>管理小区停车位资源及租赁状态</p></div>
        <Space>
          <Select allowClear placeholder="筛选状态" style={{ width: 120 }} value={filterStatus} onChange={setFilterStatus}
            options={[{ value: '空闲', label: '空闲' }, { value: '已租', label: '已租' }, { value: '已售', label: '已售' }]} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增车位</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal title={editing ? '编辑车位' : '新增车位'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} destroyOnClose>
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item name="community_id" label="所属小区" rules={[{ required: true }]}>
              <Select placeholder="选择小区" options={communities.map(c => ({ value: c.id, label: c.name }))} />
            </Form.Item>
          )}
          <Form.Item name="space_number" label="车位号" rules={[{ required: true }]}>
            <Input placeholder="如：A-001" />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select options={[{ value: '地上', label: '地上' }, { value: '地下', label: '地下' }]} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: '空闲', label: '空闲' }, { value: '已租', label: '已租' }, { value: '已售', label: '已售' }]} />
          </Form.Item>
          <Form.Item name="unit_id" label="绑定房屋">
            <Select allowClear showSearch optionFilterProp="label" placeholder="选择房屋"
              options={units.map(u => ({ value: u.id, label: `${u.community_name} ${u.building_name} ${u.unit_number}` }))} />
          </Form.Item>
          <Form.Item name="monthly_fee" label="月租(元)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
