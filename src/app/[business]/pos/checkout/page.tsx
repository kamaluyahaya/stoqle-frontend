'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import GlobalDiscountDialog from '@/components/forms/dialog/globalDiscountForm';
import PaymentMethodDialog from '@/components/forms/dialog/paymentMethod';
import useCheckout from '@/hooks/useCheckout';
import ItemsTable from '@/components/checkout/itemsTable';
import PaymentsPanel from '@/components/checkout/paymentPanel';

export default function CheckoutPage() {
  const router = useRouter();
  

  // replace the line above with this full destructure:
  const {
    items,
    loading,
    payments,
    subTotal,
    itemDiscountTotal,
    globalDiscountAmount,
    totalDiscount,
    total,
    sumPayments,
    remainingAmount,
    formatPrice,
    updateQuantity,
    removeItem,
    addPayment,
    removePayment,
    setShowPaymentDialog,
    setPaymentDialogDefaultAmount,
    showPaymentDialog,
    paymentDialogDefaultAmount,
    setGlobalDiscountValue,
    setGlobalIsPercentage,
    globalDiscountValue,
    globalIsPercentage,
    setSelectedCustomer,
    storeId,
    setStoreId,
    applyGlobalDiscount,
    finalizeCharge,
    backToPOS,
    setPayments,
    setGlobalDiscountValue: setGlobalValueInHook,
    setGlobalIsPercentage: setGlobalPctInHook,

    saleCompleted,
    saleData,
    receiptEmail,
    selectedCustomer,
    setReceiptEmail,
  } = useCheckout();

  // local control for showing dialogs on this page
  const [showGlobalDiscountDialog, setShowGlobalDiscountDialog] = React.useState(false);
  const [showPaymentDialogLocal, setShowPaymentDialogLocal] = React.useState(false);
  const [paymentDialogDefaultAmountLocal, setPaymentDialogDefaultAmountLocal] = React.useState(0);

  // keep the hook's payment dialog state in sync when user triggers from this page
  useEffect(() => {
    setShowPaymentDialog(showPaymentDialogLocal);
    setPaymentDialogDefaultAmount(paymentDialogDefaultAmountLocal);
  }, [showPaymentDialogLocal, paymentDialogDefaultAmountLocal, setShowPaymentDialog, setPaymentDialogDefaultAmount]);

  // clear global discount helper
  const clearGlobalDiscount = () => {
    setGlobalValueInHook('0');
    setGlobalPctInHook(false);
    toast('Cleared');
  };

  // Payment dialog apply handler
  const handleAddPayment = (p: { id?: string | number; method: string; amount: number; reference?: string | null }) => {
    addPayment(p);
    setShowPaymentDialogLocal(false);
  };

  // helper to add exact cash payment (used by PaymentsPanel "Pay exact (cash)")
  const handleAddExactCash = (amount: number) => {
    const cashPayment = { id: Date.now(), method: 'cash', amount, reference: null };
    addPayment(cashPayment);
    // toast.success('Added cash payment for remaining amount');
  };

  // finalize: forward to hook, then navigate to root
  const handleFinalize = async () => {
  await finalizeCharge();
  // router.push('/'); // only navigate if you want — keep commented while testing
};
  // back to POS: persist and go back
  const handleBackToPOS = () => {
    backToPOS((path: string) => router.push(path));
    
  };

  // if (loading) return <div className="p-6">Loading...</div>;

  return (
    <>
    <div className="space-y-8 p-6 md:p-12 sm:p-6 bg-gray-100  min-h-screen rounded-xl">
      

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Checkout <span className="text-blue-500">Sales</span>
          </h1>
        </div>

        <div className="text-sm text-gray-500">
          {/* show store + customer if available */}
          <div>{selectedCustomer ? `${selectedCustomer.customer_name} (${selectedCustomer.user_id})` : 'Walk-in'}</div>
         
          
          <div className="text-xs text-gray-400">Storess: {storeId}</div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <ItemsTable
  items={items}
  updateQuantity={updateQuantity}
  removeItem={removeItem}
  formatPrice={formatPrice}
  subTotal={subTotal}
  itemDiscountTotal={itemDiscountTotal}
  total={total}
  saleCompleted={saleCompleted}    // <-- NEW
/>
        <div className="sticky top-6">
         <PaymentsPanel
         chargingLoading = {loading}
            items={items}
            payments={payments}
            sumPayments={sumPayments}
            remainingAmount={remainingAmount}
            total={total}
            subTotal={subTotal}
            totalDiscount={totalDiscount}
            globalDiscountValue={globalDiscountValue}
            globalIsPercentage={globalIsPercentage}
            setShowGlobalDiscountDialog={(b) => setShowGlobalDiscountDialog(b)}
            clearGlobalDiscount={clearGlobalDiscount}
            setShowPaymentDialog={(b) => {
              setShowPaymentDialogLocal(b);
            }}
            setPaymentDialogDefaultAmount={(n) => setPaymentDialogDefaultAmountLocal(n)}
            addExactCashPayment={(amount) => {
              handleAddExactCash(amount);
            }}
            removePayment={removePayment}
            formatPrice={formatPrice}
            handleFinalizeCharge={handleFinalize}

            /* <-- NEW: success/receipt props */
            saleCompleted={saleCompleted}
            saleData={saleData}
            receiptEmail={receiptEmail}
            setReceiptEmail={setReceiptEmail}
          />

        </div>
      </motion.div>

      <div className="mt-4 text-xs text-gray-400">
        Discounts shown include item-level discounts (if set) and the global discount. Sub Total is the sum of unit price × quantity before discounts.
      </div>
    </div>
    <GlobalDiscountDialog
        show={showGlobalDiscountDialog}
        onClose={() => setShowGlobalDiscountDialog(false)}
        initialValue={globalDiscountValue}
        initialIsPercentage={globalIsPercentage}
        onApply={(value, isPct) => {
          setGlobalValueInHook(value);
          setGlobalPctInHook(isPct);
          const display = isPct
            ? `${value}%`
            : `₦ ${parseFloat(value).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
          toast.success(`Applied global discount: ${display}`);
          setShowGlobalDiscountDialog(false);
        }}
      />

      <PaymentMethodDialog
        show={showPaymentDialogLocal}
        onClose={() => setShowPaymentDialogLocal(false)}
        defaultAmount={paymentDialogDefaultAmountLocal}
        onApply={(p) => handleAddPayment(p)}
      /></>
  );
}
