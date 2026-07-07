import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';

interface Building {
  id: number;
  community_id: number;
  community_name: string;
  name: string;
  floors: number;
  units_per_floor: number;
  unit_count: number;
  description: string;
}

interface Community { id: number; name: string; }

export default function Buildings() {
  const [data, setData] = useState<Building[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    api.get('/buildings').then(res => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    api.get('/communities').then(res => setCommunities(res.data));
  }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.put(`/buildings/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/buildings', values);
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
    { title: '所属小区', dataIndex: 'community_name', key: 'community_name' },
    { title: '楼栋名称', dataIndex: 'name', key: 'name' },
    { title: '楼层数', dataIndex: 'floors', key: 'floors' },
    { title: '每层户数', dataIndex: 'units_per_floor', key: 'units_per_floor' },
    { title: '房屋数', dataIndex: 'unit_count', key: 'unit_count' },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Building) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={async () => { await api.delete(`/buildings/${record.id}`); message.success('删除成功'); fetchData(); }}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h2>楼栋管理</h2><p>管理各小区的楼栋信息</p></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增楼栋</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal title={editing ? '编辑楼栋' : '新增楼栋'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} destroyOnClose>
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item name="community_id" label="所属小区" rules={[{ required: true }]}>
              <Select placeholder="选择小区" options={communities.map(c => ({ value: c.id, label: c.name }))} />
            </Form.Item>
          )}
          <Form.Item name="name" label="楼栋名称" rules={[{ required: true }]}>
            <Input placeholder="如：1号楼" />
          </Form.Item>
          <Form.Item name="floors" label="楼层数" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="units_per_floor" label="每层户数" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
