import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';

interface RepairOrder {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  handler: string;
  result: string;
  unit_number: string;
  community_name: string;
  resident_name: string;
  created_at: string;
  completed_at: string;
}

interface Unit { id: number; unit_number: string; building_name: string; community_name: string; }

const statusColors: Record<string, string> = { '待处理': 'orange', '处理中': 'blue', '已完成': 'green', '已取消': 'default' };
const priorityColors: Record<string, string> = { '紧急': 'red', '普通': 'default' };

export default function Repairs() {
  const [data, setData] = useState<RepairOrder[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [handleOpen, setHandleOpen] = useState(false);
  const [current, setCurrent] = useState<RepairOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [createForm] = Form.useForm();
  const [handleForm] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    const params = filterStatus ? { status: filterStatus } : {};
    api.get('/repairs', { params }).then(res => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    api.get('/units').then(res => setUnits(res.data));
  }, [filterStatus]);

  const handleCreate = async () => {
    const values = await createForm.validateFields();
    await api.post('/repairs', values);
    message.success('工单创建成功');
    setCreateOpen(false);
    createForm.resetFields();
    fetchData();
  };

  const handleUpdate = async () => {
    const values = await handleForm.validateFields();
    await api.put(`/repairs/${current!.id}`, values);
    message.success('工单更新成功');
    setHandleOpen(false);
    handleForm.resetFields();
    setCurrent(null);
    fetchData();
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '小区', dataIndex: 'community_name', key: 'community_name' },
    { title: '房号', dataIndex: 'unit_number', key: 'unit_number' },
    { title: '类别', dataIndex: 'category', key: 'category' },
    { title: '优先级', dataIndex: 'priority', key: 'priority', render: (p: string) => <Tag color={priorityColors[p]}>{p}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
    { title: '处理人', dataIndex: 'handler', key: 'handler', render: (v: string) => v || '-' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 170 },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: unknown, record: RepairOrder) => (
        <Space>
          {record.status !== '已完成' && (
            <Button type="link" icon={<EditOutlined />} onClick={() => {
              setCurrent(record);
              handleForm.setFieldsValue({ status: record.status === '待处理' ? '处理中' : record.status, handler: record.handler, result: record.result });
              setHandleOpen(true);
            }}>处理</Button>
          )}
          <Popconfirm title="确定删除？" onConfirm={async () => { await api.delete(`/repairs/${record.id}`); message.success('删除成功'); fetchData(); }}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h2>报修工单</h2><p>管理住户报修请求及处理进度</p></div>
        <Space>
          <Select allowClear placeholder="筛选状态" style={{ width: 120 }} value={filterStatus} onChange={setFilterStatus}
            options={[{ value: '待处理', label: '待处理' }, { value: '处理中', label: '处理中' }, { value: '已完成', label: '已完成' }]} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateOpen(true); }}>新建工单</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal title="新建报修工单" open={createOpen} onOk={handleCreate} onCancel={() => setCreateOpen(false)} destroyOnClose>
        <Form form={createForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="报修问题简述" />
          </Form.Item>
          <Form.Item name="unit_id" label="房屋">
            <Select allowClear showSearch optionFilterProp="label" placeholder="选择房屋"
              options={units.map(u => ({ value: u.id, label: `${u.community_name} ${u.building_name} ${u.unit_number}` }))} />
          </Form.Item>
          <Form.Item name="category" label="类别">
            <Select options={['水电', '门窗', '电梯', '管道', '其他'].map(v => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select options={[{ value: '普通', label: '普通' }, { value: '紧急', label: '紧急' }]} />
          </Form.Item>
          <Form.Item name="description" label="详细描述">
            <Input.TextArea rows={3} placeholder="请描述具体问题" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="处理工单" open={handleOpen} onOk={handleUpdate} onCancel={() => { setHandleOpen(false); setCurrent(null); }} destroyOnClose>
        <Form form={handleForm} layout="vertical">
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={[{ value: '处理中', label: '处理中' }, { value: '已完成', label: '已完成' }, { value: '已取消', label: '已取消' }]} />
          </Form.Item>
          <Form.Item name="handler" label="处理人">
            <Input placeholder="维修人员姓名" />
          </Form.Item>
          <Form.Item name="result" label="处理结果">
            <Input.TextArea rows={3} placeholder="处理结果说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
