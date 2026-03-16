'use client';

import { useEffect } from 'react';
import { useOrgStore } from '@/stores/org-store';
import type { OrgMembership } from '@/types/saas';

type OrgStoreHydratorProps = {
  orgs: OrgMembership[];
};

export function OrgStoreHydrator({ orgs }: OrgStoreHydratorProps) {
  const { setOrgs } = useOrgStore();

  useEffect(() => {
    if (orgs.length > 0) {
      setOrgs(orgs);
    }
  }, [orgs, setOrgs]);

  return null;
}
