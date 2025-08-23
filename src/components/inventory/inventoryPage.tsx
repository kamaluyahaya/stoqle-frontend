// // FILE: components/inventory/InventoryPage.tsx

// 'use client';
// import React, { useState, useRef } from 'react';
// import { motion } from 'framer-motion';
// import { Search } from 'lucide-react';
// import ProductDetailsDialog from '@/components/forms/dialog/inventory/dialogProductDetails';
// import StoreSelectDialog from '@/components/forms/dialog/inventory/selectStore';
// import ConfirmDialog from '@/components/forms/dialog/dialogForm';
// import AllProducts from './allProduct';
// import { useInventoryManager } from '@/hooks/useInventory';

// const TABS = [
//   { key: 'all-products', label: 'All Products' },
//   { key: 'stock-adjustment', label: 'Stock Adjustment' },
//   { key: 'stock-count', label: 'Stock Count' },
//   { key: 'inventory-transfer', label: 'Inventory Transfer' },
//   { key: 'stock-label', label: 'Stock Label' },
// ];

// export default function InventoryPage() {
//   const manager = useInventoryManager();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeTab, setActiveTab] = useState<string>('all-products');
//   const [showProductDialog, setShowProductDialog] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<any>(null);
//   const [showStoreDialog, setShowStoreDialog] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [deletingProduct, setDeletingProduct] = useState<any>(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
//   const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

//   const filtered = manager.products.filter(p => {
//     const term = searchTerm.toLowerCase();
//     const name = (p.name || '').toLowerCase();
//     const sku = (p.barcode || '').toLowerCase();
//     const category = manager.getCategoryName(p.category_id).toLowerCase();
//     return name.includes(term) || sku.includes(term) || category.includes(term);
//   });

//   function openProductDetails(product: any) {
//     setSelectedProduct(product);
//     setShowProductDialog(true);
//   }

//   return (
//     <div className="space-y-8 p-6 md:p-12 sm:p-6 bg-gray-100 min-h-screen rounded-xl">
//       <ProductDetailsDialog show={showProductDialog} onClose={() => setShowProductDialog(false)} product={selectedProduct ?? null} />
//       <StoreSelectDialog show={showStoreDialog} onClose={() => setShowStoreDialog(false)} onSelect={(s:any) => manager.setSelectedStore(s)} />
//       <ConfirmDialog show={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={() => {}} title={`Delete`} message="" confirmText="Delete" loading={false} />

//       <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 px-4 sm:px-0">Inventory <span className="text-blue-500">Control</span></h1>

//       {/* Segmented control */}
//       <div className="flex justify-center px-4 sm:px-0">
//         <div className="relative flex flex-nowrap overflow-x-auto no-scrollbar bg-gray-200 rounded-full p-1 w-full md:w-auto max-w-4xl shadow-sm" ref={containerRef}>
//           <motion.div className="absolute top-0 bottom-0 rounded-full bg-blue-600" initial={false} animate={{ left: indicatorStyle.left, width: indicatorStyle.width }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} style={{ position: 'absolute' }} />
//           {TABS.map(tab => (
//             <button key={tab.key} ref={el => buttonRefs.current[tab.key] = el} onClick={() => { setActiveTab(tab.key); manager.setSelectedForStore({}); manager.setAdjustments({}); manager.setSelectedStore(null); }} className={`relative z-10 flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm md:text-base transition-colors duration-200 text-center whitespace-nowrap ${activeTab === tab.key ? 'text-white' : 'text-gray-700'}`}>
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Tab panels */}
//       {activeTab === 'stock-adjustment' && (
//         <StockAdjustment manager={manager} openStoreDialog={() => setShowStoreDialog(true)} />
//       )}

//       {activeTab === 'all-products' && (
//         <AllProducts products={filtered} loading={manager.loading} onAdd={manager.setInventoryMode as any} handleAddStore={(p:any)=>{ manager.setTriggeredProductId(String(p.product_id)); manager.setSelectedAction(prev=>({...prev, [String(p.product_id)]: 'addition'})); manager.setInventoryMode('addition'); setShowStoreDialog(true); }} handleRemoveStore={(p:any)=>{ manager.setTriggeredProductId(String(p.product_id)); manager.setSelectedAction(prev=>({...prev, [String(p.product_id)]: 'subtraction'})); manager.setInventoryMode('subtraction'); setShowStoreDialog(true); }} openProductDetails={openProductDetails} />
//       )}
//     </div>
//   );
// }


// /* --------------------------------------------------------------------------- */