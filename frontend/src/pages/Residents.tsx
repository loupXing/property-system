import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';

interface Resident {
  id: number;
  unit_id: number;
  community_name: string;
  building_name: string;
  unit_number: string;
  name: string;
  phone: string;
  id_card: string;
  type: string;
  move_in_date: string;
  status: string;
}

interface Unit { id: number; unit_number: string; building_name: string; community_name: string; }

export default function Residents() {
  const [data, setData] = useState<Resident[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Resident | null>(null);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    api.get('/residents').then(res => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    api.get('/units').then(res => setUnits(res.data));
  }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.put(`/residents/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/residents', values);
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
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '小区', dataIndex: 'community_name', key: 'community_name' },
    { title: '楼栋', dataIndex: 'building_name', key: 'building_name' },
    { title: '房号', dataIndex: 'unit_number', key: 'unit_number' },
    { title: '身份', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === '业主' ? 'blue' : 'cyan'}>{t}</Tag> },
    { title: '入住日期', dataIndex: 'move_in_date', key: 'move_in_date' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === '在住' ? 'green' : 'default'}>{s}</Tag> },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Resident) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={async () => { await api.delete(`/residents/${record.id}`); message.success('删除成功'); fetchData(); }}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h2>住户管理</h2><p>管理业主和租户信息</p></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增住户</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal title={editing ? '编辑住户' : '新增住户'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} destroyOnClose width={520}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="phone" label="电话" rules={[{ required: true }]}>
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item name="unit_id" label="所属房屋">
            <Select allowClear placeholder="选择房屋" showSearch optionFilterProp="label"
              options={units.map(u => ({ value: u.id, label: `${u.community_name} ${u.building_name} ${u.unit_number}` }))} />
          </Form.Item>
          <Form.Item name="id_card" label="身份证号">
            <Input placeholder="请输入身份证号" />
          </Form.Item>
          <Form.Item name="type" label="身份">
            <Select options={[{ value: '业主', label: '业主' }, { value: '租户', label: '租户' }]} />
          </Form.Item>
          <Form.Item name="move_in_date" label="入住日期">
            <Input placeholder="如：2024-01-01" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: '在住', label: '在住' }, { value: '搬离', label: '搬离' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
