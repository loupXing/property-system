import { Select } from 'antd';
import type { CSSProperties } from 'react';

interface CommunityFilterProps {
  value?: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
  loading?: boolean;
  style?: CSSProperties;
}

export default function CommunityFilter({ value, onChange, options, loading, style }: CommunityFilterProps) {
  return (
    <Select
      style={{ width: 180, ...style }}
      placeholder="选择小区"
      value={value}
      onChange={onChange}
      options={options}
      loading={loading}
      showSearch
      optionFilterProp="label"
    />
  );
}
