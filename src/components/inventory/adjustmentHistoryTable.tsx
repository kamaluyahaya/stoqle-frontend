'use client';
import { formatCustomDate } from '@/components/dateFormatting/formattingDate';
import { resolveAdjustedByName } from '@/lib/inventoryUtils';

export default function AdjustmentHistoryTable({
  adjustmentsHistory,
  loadingAdjustments,
  historyError
}: {
  adjustmentsHistory: any[],
  loadingAdjustments: boolean,
  historyError: string | null
}) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Showing recent stock adjustments</div>
        <div className="text-sm text-gray-600">{loadingAdjustments ? 'Loading...' : `${adjustmentsHistory.length} records`}</div>
      </div>

      <div className="max-h-96 overflow-auto">
        {loadingAdjustments ? (
          <div className="py-8 text-center text-gray-500">Loading adjustments...</div>
        ) : historyError ? (
          <div className="py-8 text-center text-red-500">{historyError}</div>
        ) : adjustmentsHistory.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No adjustments found</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Store</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">By</th>
              </tr>
            </thead>
            <tbody>
              {adjustmentsHistory.map((a: any) => {
                const key = a.adjustment_id ?? `${a.product_id}-${a.created_at}`;
                const typeLabel =
                  a.change_type === 'subtraction' ? 'Remove' :
                  a.change_type === 'addition' ? 'Add' :
                  a.change_type === 'transfer' ? 'Transfer' :
                  (a.change_type ?? '-');

                const storeDisplay = a.change_type === 'transfer'
                  ? `${a.from_store_name ?? a.from_store?.store_name ?? '-'} → ${a.to_store_name ?? a.to_store?.store_name ?? '-'}`
                  : (a.store_name ?? a.store?.store_name ?? '-');

                const adjustedByName = resolveAdjustedByName(a) ?? (a.adjusted_by ? `Staff #${a.adjusted_by}` : '-');
                const initials = adjustedByName.split(' ').map((p:string)=> p[0]).slice(0,2).join('').toUpperCase();

                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-600 w-36">{formatCustomDate(a.created_at)}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-3">
                        {a.product_image_url ? (
                          <img src={a.product_image_url}
                               alt={a.product_name ?? a.product?.name ?? 'product'}
                               className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                               onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-sm border border-gray-100">
                            {(a.product_name ?? a.product?.name ?? 'P').slice(0,1).toUpperCase()}
                          </div>
                        )}

                        <div className="leading-tight">
                          <div className="font-medium text-gray-900">{a.product_name ?? a.product?.name ?? `#${a.product_id}`}</div>
                          <div className="text-xs text-gray-400">{a.product_barcode ?? ''}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-2 text-sm text-gray-700">{storeDisplay}</td>

                    <td className="px-3 py-2 text-sm">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        a.change_type === 'addition' ? 'bg-green-100 text-green-700' :
                        a.change_type === 'subtraction' ? 'bg-red-100 text-red-700' :
                        a.change_type === 'transfer' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{typeLabel}</span>
                    </td>

                    <td className="px-3 py-2 text-sm">{Number(a.quantity_change ?? a.qty ?? 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{a.reason ?? '-'}</td>

                    <td className="px-3 py-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        {a.adjusted_by_profile ? (
                          <img src={a.adjusted_by_profile} alt={adjustedByName} className="w-8 h-8 rounded-full object-cover border border-gray-100" onError={(e:any)=>{ e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-700 font-medium border border-gray-100">
                            {initials}
                          </div>
                        )}
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">{adjustedByName}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
