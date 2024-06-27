'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

export default function Home() {
  const EorzeaMap = useMemo(
    () =>
      dynamic(() => import('@/common/EorzeaMap'), {
        loading: () => <p>map loading...</p>,
        ssr: false,
      }),
    []
  );

  return (
    <main>
      <EorzeaMap />
    </main>
  );
}
