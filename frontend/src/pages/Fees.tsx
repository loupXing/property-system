import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Popconfirm, Tabs, message } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import api from '../api';
import { useCommunityFilter } from '../hooks/useCommunityFilter';
import CommunityFilter from '../components/CommunityFilter';

interface Bill {
  id: number;
  unit_number: string;
  building_name: string;
  community_name: string;
  fee_type_name: string;
  amount: number;
  period: string;
  status: string;
  due_date: string;
  paid_at: string;
}

interface FeeType {
  id: number;
  name: string;
  unit_price: number;
  unit: string;
  description: string;
}

interface Unit { id: number; unit_number: string; building_name: string; community_name: string; }

export default function Fees() {
  const { communityId, setCommunityId, options, loading: communityLoading } = useCommunityFilter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [billForm] = Form.useForm();
  const [typeForm] = Form.useForm();

  const fetchBills = () => {
    if (!communityId) return;
    setLoading(true);
    const params: Record<string, string | number> = { community_id: communityId };
    if (filterStatus) params.status = filterStatus;
    api.get('/fees/bills', { params }).then(res => setBills(res.data)).finally(() => setLoading(false));
  };

  const fetchFeeTypes = () => {
    api.get('/fees/types').then(res => setFeeTypes(res.data));
  };

  const fetchUnits = () => {
    if (!communityId) return;
    api.get('/units', { params: { community_id: communityId } }).then(res => setUnits(res.data));
  };

  useEffect(() => { fetchFeeTypes(); }, []);
  useEffect(() => { fetchUnits(); }, [communityId]);
  useEffect(() => { fetchBills(); }, [communityId, filterStatus]);

  const handleCreateBill = async () => {
    const values = await billForm.validateFields();
    await api.post('/fees/bills', values);
    message.success('账单创建成功');
    setBillModalOpen(false);
    billForm.resetFields();
    fetchBills();
  };

  const handleCreateType = async () => {
    const values = await typeForm.validateFields();
    await api.post('/fees/types', values);
    message.success('费用类型创建成功');
    setTypeModalOpen(false);
    typeForm.resetFields();
    fetchFeeTypes();
  };

  const handlePay = async (id: number) => {
    await api.post(`/fees/bills/${id}/pay`);
    message.success('缴费成功');
    fetchBills();
  };

  const billColumns = [
    { title: '楼栋', dataIndex: 'building_name', key: 'building_name' },
    { title: '房号', dataIndex: 'unit_number', key: 'unit_number' },
    { title: '费用类型', dataIndex: 'fee_type_name', key: 'fee_type_name' },
    { title: '账期', dataIndex: 'period', key: 'period' },
    { title: '金额(元)', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '到期日', dataIndex: 'due_date', key: 'due_date' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === '已缴' ? 'green' : 'red'}>{s}</Tag> },
    {
      title: '操作', key: 'action', width: 160,
      render: (_: unknown, record: Bill) => (
        <Space>
          {record.status === '未缴' && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handlePay(record.id)}>确认缴费</Button>
          )}
          <Popconfirm title="确定删除？" onConfirm={async () => { await api.delete(`/fees/bills/${record.id}`); message.success('删除成功'); fetchBills(); }}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const typeColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '单价', dataIndex: 'unit_price', key: 'unit_price' },
    { title: '单位', dataIndex: 'unit', key: 'unit' },
    { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>费用管理</h2>
        <p>按小区管理物业费、停车费等账单</p>
      </div>

      <Tabs items={[
        {
          key: 'bills', label: '账单管理',
          children: (
            <>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <Space wrap>
                  <CommunityFilter value={communityId} onChange={setCommunityId} options={options} loading={communityLoading} />
                  <Select allowClear placeholder="筛选状态" style={{ width: 120 }} value={filterStatus} onChange={setFilterStatus}
                    options={[{ value: '未缴', label: '未缴' }, { value: '已缴', label: '已缴' }]} />
                </Space>
                <Button type="primary" icon={<PlusOutlined />} disabled={!communityId} onClick={() => { billForm.resetFields(); setBillModalOpen(true); }}>生成账单</Button>
              </div>
              <Table columns={billColumns} dataSource={bills} rowKey="id" loading={loading} />
            </>
          ),
        },
        {
          key: 'types', label: '费用类型',
          children: (
            <>
              <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { typeForm.resetFields(); setTypeModalOpen(true); }}>新增类型</Button>
              </div>
              <Table columns={typeColumns} dataSource={feeTypes} rowKey="id" />
            </>
          ),
        },
      ]} />

      <Modal title="生成账单" open={billModalOpen} onOk={handleCreateBill} onCancel={() => setBillModalOpen(false)} destroyOnClose>
        <Form form={billForm} layout="vertical">
          <Form.Item name="unit_id" label="房屋" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" placeholder="选择房屋"
              options={units.map(u => ({ value: u.id, label: `${u.building_name} ${u.unit_number}` }))} />
          </Form.Item>
          <Form.Item name="fee_type_id" label="费用类型" rules={[{ required: true }]}>
            <Select placeholder="选择费用类型" options={feeTypes.map(t => ({ value: t.id, label: `${t.name} (${t.unit_price}${t.unit})` }))} />
          </Form.Item>
          <Form.Item name="amount" label="金额(元)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="period" label="账期" rules={[{ required: true }]}>
            <Input placeholder="如：2026-03" />
          </Form.Item>
          <Form.Item name="due_date" label="到期日">
            <Input placeholder="如：2026-03-31" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="新增费用类型" open={typeModalOpen} onOk={handleCreateType} onCancel={() => setTypeModalOpen(false)} destroyOnClose>
        <Form form={typeForm} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如：物业管理费" />
          </Form.Item>
          <Form.Item name="unit_price" label="单价" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="如：元/㎡/月" />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
