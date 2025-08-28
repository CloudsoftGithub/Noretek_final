'use client';
import { useSession } from '@/contexts/SessionContext';

export default function TestAuth() {
  const { data: session, status } = useSession();
  
  return (
    <div className="container py-5">
      <h1>Custom Session Test</h1>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}