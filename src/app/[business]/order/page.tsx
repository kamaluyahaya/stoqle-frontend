"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Truck, CheckCircle, XCircle, RefreshCw, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/forms/dialog/dialogForm";
import { formatCustomDate } from "@/components/dateFormatting/formattingDate";

interface Product {
  product_id: number;
  business_id?: number | null;
  name: string;
  slug?: string | null;
  price?: string | null;
}

interface Order {
  order_id: number;
  product_id: number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  delivery_address?: string | null;
  quantity?: number | null;
  special_instruction?: string | null;
  created_at?: string | null;
  product?: Product | null;
  variant?: any | null;
}

/**
 * Important:
 * - Do NOT declare a top-level `PageProps` type here — Next generates its own and naming collisions break the build.
 * - Use `props: any` (or inline param types) so Next's generated types are not compared to a user-defined PageProps.
 */
export default function VendorsOrdersPage(props: any) {
  const { params, searchParams } = props ?? {};
  // Derive vendorBusinessId from searchParams (if provided).
  let vendorBusinessId: number | null = null;
  if (searchParams?.vendorBusinessId) {
    const raw = Array.isArray(searchParams.vendorBusinessId)
      ? searchParams.vendorBusinessId[0]
      : searchParams.vendorBusinessId;
    const n = Number(raw);
    vendorBusinessId = Number.isFinite(n) ? n : null;
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
  const API_ENDPOINT = `${API_BASE}/api/orders/orders`;

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const getToken = () => {
    try {
      if (typeof window === "undefined") return null;
      return JSON.parse(localStorage.getItem("token") || "null");
    } catch (e) {
      console.warn("Failed to parse token", e);
      return null;
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(API_ENDPOINT, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      });

      const data = await res.json();

      if (res.status === 401 || data.message === "Unauthorized") {
        if (typeof window !== "undefined") localStorage.removeItem("token");
        toast.error("Session expired. Please log in again");
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

      const list: Order[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setOrders(list);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error(err);
      toast.error(err?.message || "Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteOrder = async () => {
    if (!deletingOrder?.order_id) return;
    try {
      setDeleting(true);
      const token = getToken();
      if (!token) throw new Error("No auth token found. Please log in.");

      const res = await fetch(`${API_BASE}/api/orders/${deletingOrder.order_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");

      toast.success(`Order #${deletingOrder.order_id} rejected`, { position: "top-center" });
      setOrders(prev => prev.filter(o => o.order_id !== deletingOrder.order_id));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to reject order");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeletingOrder(null);
    }
  };

  const markCompleted = async (orderId: number) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("No auth token found. Please log in.");

      const res = await fetch(`${API_BASE}/api/orders/${orderId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to complete order");

      toast.success(`Order #${orderId} marked completed`, { position: "top-center" });
      setOrders(prev => prev.map(o => (o.order_id === orderId ? { ...o } : o)));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not mark completed");
    } finally {
      setLoading(false);
    }
  };

  const normalizePhone = (phone?: string | null) => {
    if (!phone) return null;
    let normalized = phone.replace(/\D/g, "");
    if (normalized.startsWith("0")) normalized = "234" + normalized.slice(1);
    if (!normalized.startsWith("234")) normalized = "234" + normalized;
    return normalized;
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orders
      .filter(o => {
        if (vendorBusinessId != null && o.product && o.product.business_id != null) {
          if (o.product.business_id !== vendorBusinessId) return false;
        }
        if (!term) return true;
        return (
          String(o.order_id).includes(term) ||
          o.full_name?.toLowerCase().includes(term) ||
          o.email?.toLowerCase().includes(term) ||
          o.product?.name?.toLowerCase().includes(term) ||
          o.delivery_address?.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }, [orders, searchTerm, vendorBusinessId]);

  return (
    <div className="space-y-8 p-6 md:p-12 bg-gray-100 min-h-screen rounded-xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <h1 className="text-3xl font-semibold text-gray-900">
          Orders <span className="text-blue-500">({filtered.length})</span>
        </h1>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2 bg-gray-100 placeholder-gray-400 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-200 hover:shadow"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {loading ? (
        <p className="text-center text-gray-500">Loading orders...</p>
      ) : filtered.length ? (
        <div className="grid gap-6">
          {filtered.map(o => (
            <motion.div
              key={o.order_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Order #{o.order_id}</h2>
                <span className="text-sm text-gray-500">{formatCustomDate(o.created_at ? new Date(o.created_at) : undefined)}</span>
              </div>

              <p className="text-gray-700">
                <span className="font-medium">Product:</span> {o.product?.name} × {o.quantity}
              </p>

              <p className="text-gray-700">
                <span className="font-medium">Customer:</span> {o.full_name}
              </p>

              <p className="text-gray-700">
                <span className="font-medium">Address:</span> {o.delivery_address}
              </p>

              {o.special_instruction && (
                <p className="text-sm text-gray-500 italic">“{o.special_instruction}”</p>
              )}

              <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => markCompleted(o.order_id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition"
                >
                  <CheckCircle className="w-4 h-4" /> Complete
                </button>

                <button
                  onClick={() => {
                    setDeletingOrder(o);
                    setShowDeleteDialog(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>

                {o.phone && (
                  <a
                    href={`https://wa.me/${normalizePhone(o.phone)}?text=Hello%20${encodeURIComponent(
                      o.full_name
                    )},%20regarding%20your%20order%20#${o.order_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                  >
                    <MessageCircle className="w-4 h-4" /> Message
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No orders found.</p>
      )}

      <ConfirmDialog
        show={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingOrder(null);
        }}
        onConfirm={handleDeleteOrder}
        title={`Reject Order #${deletingOrder?.order_id || ""}?`}
        message={`This will reject order #${deletingOrder?.order_id || ""} and notify the customer.`}
        confirmText="Reject Order"
        loading={deleting}
      />
    </div>
  );
}
