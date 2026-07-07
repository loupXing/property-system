import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';

interface Unit {
  id: number;
  building_id: number;
  community_name: string;
  building_name: string;
  unit_number: string;
  floor: number;
  area: number;
  type: string;
  status: string;
  resident_name: string;
}

interface Building { id: number; name: string; community_name: string; }

const statusColors: Record<string, string> = { '空置': 'default', '已入住': 'green', '装修中': 'orange' };

export default function Units() {
  const [data, setData] = useState<Unit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    const params = filterStatus ? { status: filterStatus } : {};
    api.get('/units', { params }).then(res => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    api.get('/buildings').then(res => setBuildings(res.data));
  }, [filterStatus]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.put(`/units/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/units', values);
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
    { title: '楼栋', dataIndex: 'building_name', key: 'building_name' },
    { title: '房号', dataIndex: 'unit_number', key: 'unit_number' },
    { title: '楼层', dataIndex: 'floor', key: 'floor' },
    { title: '面积(㎡)', dataIndex: 'area', key: 'area' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
    { title: '住户', dataIndex: 'resident_name', key: 'resident_name', render: (v: string) => v || '-' },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Unit) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={async () => { await api.delete(`/units/${record.id}`); message.success('删除成功'); fetchData(); }}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h2>房屋管理</h2><p>管理所有房屋信息及入住状态</p></div>
        <Space>
          <Select allowClear placeholder="筛选状态" style={{ width: 120 }} value={filterStatus} onChange={setFilterStatus}
            options={[{ value: '空置', label: '空置' }, { value: '已入住', label: '已入住' }, { value: '装修中', label: '装修中' }]} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增房屋</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal title={editing ? '编辑房屋' : '新增房屋'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} destroyOnClose>
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item name="building_id" label="所属楼栋" rules={[{ required: true }]}>
              <Select placeholder="选择楼栋" showSearch optionFilterProp="label"
                options={buildings.map(b => ({ value: b.id, label: `${b.community_name} - ${b.name}` }))} />
            </Form.Item>
          )}
          <Form.Item name="unit_number" label="房号" rules={[{ required: true }]}>
            <Input placeholder="如：101" />
          </Form.Item>
          <Form.Item name="floor" label="楼层" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={-3} />
          </Form.Item>
          <Form.Item name="area" label="面积(㎡)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select options={[{ value: '住宅', label: '住宅' }, { value: '商铺', label: '商铺' }, { value: '办公', label: '办公' }]} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: '空置', label: '空置' }, { value: '已入住', label: '已入住' }, { value: '装修中', label: '装修中' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
