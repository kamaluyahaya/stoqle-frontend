'use client';
import AdjustmentFlow from './adjustmentFlow';
import { Product } from '@/components/types/product';
import AdjustmentHistoryTable from './adjustmentHistoryTable';

export default function StockAdjustmentPanel(props: {
  inventoryMode: 'addition' | 'subtraction' | null;
  setInventoryMode: (m: 'addition' | 'subtraction' | null) => void;
  selectedStore: any;
  setSelectedStore: (s: any)=>void;
  storeSelectionStep: 1 | 2;
  setStoreSelectionStep: (n: 1|2)=>void;
  products: Product[];
  productsTrackable: Product[];
  selectedForStore: Record<string, boolean>;
  setSelectedForStore: (s:any)=>void;
  adjustments: Record<string, {qty:number|'', reason:string}>;
  setAdjustments: (s:any)=>void;
  selectedAction: Record<string, 'addition'|'subtraction'>;
  setSelectedAction: (s:any)=>void;
  fetchProducts: ()=>Promise<void>;
  fetchAdjustmentsHistory: ()=>Promise<void>;
  adjustmentsHistory: any[];
  loadingAdjustments: boolean;
  historyError: string | null;
  setShowStoreDialog: (v:boolean)=>void;
  setTriggeredProductId: (id:string|null)=>void;

  /**
   * NEW: callback invoked when the child wants to fully cancel the
   * adjustment flow (parent should clear parent state and switch tab).
   */
  onCancel: () => void;
}) {
  const {
    inventoryMode, setInventoryMode, selectedStore, setSelectedStore,
    storeSelectionStep, setStoreSelectionStep, products, productsTrackable,
    selectedForStore, setSelectedForStore, adjustments, setAdjustments,
    selectedAction, setSelectedAction, fetchProducts, fetchAdjustmentsHistory,
    adjustmentsHistory, loadingAdjustments, historyError, setShowStoreDialog,
    onCancel
  } = props;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Stock {inventoryMode ? (inventoryMode === 'addition' ? 'Mode: Adding Stock' : 'Mode: Removing Stock') : 'Showing recent stock adjustments'}</h2>
          <p className="text-sm text-gray-500">
            {/* {inventoryMode ? (inventoryMode === 'addition' ? 'Mode: Adding Stock' : 'Mode: Removing Stock') : 'Showing recent stock adjustments'} */}
            {selectedStore ? ` — Selected store: ${(selectedStore as any).store_name ?? (selectedStore as any).name ?? 'Unknown'}` : ''}
          </p>
        </div>

        <div className="text-right flex items-center gap-3">
          <button
            className="px-3 py-2 rounded-full bg-blue-600 text-white text-sm"
            onClick={() => { setInventoryMode('addition'); setSelectedStore(null); setSelectedForStore({}); setAdjustments({}); setStoreSelectionStep(1); setShowStoreDialog(true); }}
          >
            Add Stock
          </button>
          <button
            className="px-3 py-2 rounded-full bg-red-600 text-white text-sm"
            onClick={() => { setInventoryMode('subtraction'); setSelectedStore(null); setSelectedForStore({}); setAdjustments({}); setStoreSelectionStep(1); setShowStoreDialog(true); }}
          >
            Remove Stock
          </button>
        </div>
      </div>

      {/* decide whether to show history or adjustment flow */}
      {(!selectedStore && Object.values(selectedForStore).every(v => !v) && storeSelectionStep === 1)
        ? (
          <AdjustmentHistoryTable
            adjustmentsHistory={adjustmentsHistory}
            loadingAdjustments={loadingAdjustments}
            historyError={historyError}
          />
        ) : (
          <AdjustmentFlow
            inventoryMode={inventoryMode}
            productsTrackable={productsTrackable}
            selectedForStore={selectedForStore}
            setSelectedForStore={setSelectedForStore}
            adjustments={adjustments}
            setAdjustments={setAdjustments}
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            storeSelectionStep={storeSelectionStep}
            setStoreSelectionStep={setStoreSelectionStep}
            selectedStore={selectedStore}
            fetchProducts={fetchProducts}
            fetchAdjustmentsHistory={fetchAdjustmentsHistory}
            onCancel={onCancel}            
          />
        )
      }
    </div>
  );
}
