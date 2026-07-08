import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';

interface Community {
  id: number;
  name: string;
  address: string;
  area: number;
  building_count: number;
  unit_count: number;
  contact_phone: string;
  description: string;
}

export default function Communities() {
  const [data, setData] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Community | null>(null);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    api.get('/communities').then(res => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.put(`/communities/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/communities', values);
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

  const handleDelete = async (id: number) => {
    await api.delete(`/communities/${id}`);
    message.success('删除成功');
    fetchData();
  };

  const openEdit = (record: Community) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const columns = [
    { title: '小区名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: '面积(㎡)', dataIndex: 'area', key: 'area', render: (v: number) => v?.toLocaleString() },
    { title: '楼栋数', dataIndex: 'building_count', key: 'building_count' },
    { title: '房屋数', dataIndex: 'unit_count', key: 'unit_count' },
    { title: '联系电话', dataIndex: 'contact_phone', key: 'contact_phone' },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Community) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>小区管理</h2>
          <p>管理所有服务小区的基本信息</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          新增小区
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal title={editing ? '编辑小区' : '新增小区'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="小区名称" rules={[{ required: true }]}>
            <Input placeholder="请输入小区名称" />
          </Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}>
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="area" label="占地面积(㎡)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="contact_phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="小区描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
