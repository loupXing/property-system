import { useEffect, useState } from 'react';
import api from '../api';

export interface Community {
  id: number;
  name: string;
}

export function useCommunityFilter() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityId, setCommunityId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/communities').then((res) => {
      setCommunities(res.data);
      if (res.data.length > 0) {
        setCommunityId(res.data[0].id);
      }
    }).finally(() => setLoading(false));
  }, []);

  const options = communities.map((c) => ({ value: c.id, label: c.name }));

  return { communities, communityId, setCommunityId, options, loading };
}
