// src/hooks/useCustomers.ts
'use client';
import { Customer } from '@/components/types';
import { useEffect, useState } from 'react';

type UseCustomersReturn = {
  customers: Customer[];
  loading: boolean;
  fetchCustomers: () => Promise<void>;
};

export default function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch customers');
      setCustomers(data);
    } catch (err: any) {
      console.error('fetchCustomers error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, fetchCustomers };
}
