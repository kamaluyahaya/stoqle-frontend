'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/forms/dialog/dialogForm';
import CustomerForm from '@/components/forms/dialog/customerDialog';
import { formatCustomDate } from '@/components/dateFormatting/formattingDate';

interface Customer {
  id: string;
  customer_name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_added?: string;
}


export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
const fetchCustomers = async () => {
  setLoading(true);
  try {
        // const storedUser = localStorage.getItem('user');
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    // const user = storedUser ? JSON.parse(storedUser) : null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    // Check for unauthorized status
    if (res.status === 401 || data.message === 'Unauthorized') {
      localStorage.removeItem('token'); // clear token
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login'; // redirect to login
      return;
    }

    if (!res.ok) throw new Error(data.message || 'Failed to fetch');

    setCustomers(data);
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || 'Error loading customers');
  } finally {
    setLoading(false);
  }
};


  const handleDeleteCustomer = async () => {
    if (!deletingCustomer?.id) return;

    try {
      setDeleting(true);
      const token = JSON.parse(localStorage.getItem('token') || 'null');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/${deletingCustomer.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete');

      toast.success(`"${deletingCustomer.customer_name}" deleted successfully`, { position: 'top-center' });
      setCustomers(prev => prev.filter(c => c.id !== deletingCustomer.id));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete customer');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeletingCustomer(null);
    }
  };
  const displayValue = (value?: string | null) => {
  return value && value.trim() ? value : '-';
};

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return customers.filter(c =>
      c.customer_name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.address?.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  return (
    <div className="space-y-8 p-6 md:p-12 bg-gray-100 min-h-screen rounded-xl">
      <CustomerForm
        show={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false);
          setEditingCustomer(null);
        }}
        editingCustomer={editingCustomer}
        refreshCustomers={fetchCustomers}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <h1 className="text-3xl font-semibold text-gray-900">
          Total ({filtered.length}) <span className="text-blue-500">Customers</span>
        </h1>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2 bg-gray-100 placeholder-gray-400 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Create Customer Button */}
          <button
            onClick={() => {
              setEditingCustomer(null);
              setShowCustomerForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>

        <ConfirmDialog
          show={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeletingCustomer(null);
          }}
          onConfirm={handleDeleteCustomer}
          title={`Delete "${deletingCustomer?.customer_name}"?`}
          message="This will permanently remove the customer from the database."
          confirmText="Delete Customer"
          loading={deleting}
        />
      </motion.div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : filtered.length ? (
              filtered.map((c, idx) => (
                <motion.tr
                  key={c.id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {c.customer_name?.trim() || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {c.email?.trim() || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {c.phone?.trim() || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {c.address?.trim() || '-'}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {c.date_added ? new Date(c.date_added).toLocaleDateString() : '-'}
                    </td> */}

                    <td className="px-6 py-4 text-sm text-gray-500">{formatCustomDate(c.date_added ? new Date(c.date_added) : '-')}</td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingCustomer(c);
                        setShowCustomerForm(true);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingCustomer(c);
                        setShowDeleteDialog(true);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
