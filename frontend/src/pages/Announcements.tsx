import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PushpinOutlined } from '@ant-design/icons';
import api from '../api';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  author: string;
  is_pinned: number;
  created_at: string;
}

export default function Announcements() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [viewing, setViewing] = useState<Announcement | null>(null);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    api.get('/announcements').then(res => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.put(`/announcements/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/announcements', { ...values, author: '物业管理处' });
        message.success('发布成功');
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
    {
      title: '标题', dataIndex: 'title', key: 'title', ellipsis: true,
      render: (title: string, record: Announcement) => (
        <Space>
          {record.is_pinned ? <PushpinOutlined style={{ color: '#dc2626' }} /> : null}
          <a onClick={() => { setViewing(record); setViewOpen(true); }}>{title}</a>
        </Space>
      ),
    },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === '通知' ? 'blue' : 'green'}>{t}</Tag> },
    { title: '发布人', dataIndex: 'author', key: 'author' },
    { title: '发布时间', dataIndex: 'created_at', key: 'created_at', width: 170 },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Announcement) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue({ ...record, is_pinned: !!record.is_pinned }); setModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={async () => { await api.delete(`/announcements/${record.id}`); message.success('删除成功'); fetchData(); }}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h2>公告通知</h2><p>发布和管理小区公告、通知信息</p></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>发布公告</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal title={editing ? '编辑公告' : '发布公告'} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} destroyOnClose width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="公告标题" />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select options={[{ value: '通知', label: '通知' }, { value: '公告', label: '公告' }]} />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={6} placeholder="公告内容" />
          </Form.Item>
          <Form.Item name="is_pinned" label="置顶">
            <Select options={[{ value: true, label: '是' }, { value: false, label: '否' }]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={viewing?.title} open={viewOpen} onCancel={() => { setViewOpen(false); setViewing(null); }} footer={null} width={600}>
        {viewing && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={viewing.type === '通知' ? 'blue' : 'green'}>{viewing.type}</Tag>
              <span style={{ color: '#999' }}>{viewing.author} · {viewing.created_at}</span>
            </Space>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{viewing.content}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
