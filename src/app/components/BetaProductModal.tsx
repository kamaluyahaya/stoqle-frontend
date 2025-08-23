"use client"

import { X } from "lucide-react"

interface BetaProductModalProps {
  open: boolean
  closeModal: () => void
  detailLoading: boolean
  detailError: string | null
  productDetail: any
  extractImageUrl: (img: any) => string
  formatCurrency: (amount: number) => string
}

export default function BetaProductModal({
  open,
  closeModal,
  detailLoading,
  detailError,
  productDetail,
  extractImageUrl,
  formatCurrency,
}: BetaProductModalProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={closeModal}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
            aria-hidden
          />

          <div className="relative w-[92%] max-w-6xl mx-auto rounded-3xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl overflow-hidden">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 z-20 w-10 h-10 rounded-full bg-white/85 flex items-center justify-center shadow-sm"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>

            <div className="flex flex-col lg:flex-row">
              {/* Left side - Images */}
              <div className="lg:w-1/2 w-full p-6 flex flex-col gap-4 bg-white">
                {detailLoading && (
                  <div className="text-center py-12">Loading product...</div>
                )}
                {detailError && (
                  <div className="text-center text-red-600 py-12">
                    {detailError}
                  </div>
                )}

                {!detailLoading && productDetail && (
                  <>
                    <div className="w-full rounded-2xl overflow-hidden bg-gray-50 p-6 flex items-center justify-center">
                      <img
                        src={
                          extractImageUrl(productDetail.images?.[0]) ||
                          "/placeholder-product.svg"
                        }
                        alt={productDetail.product_name}
                        className="max-h-[420px] object-contain"
                      />
                    </div>

                    {productDetail.images && productDetail.images.length > 1 && (
                      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                        {productDetail.images.map((img: any, i: number) => (
                          <button
                            key={i}
                            className="rounded-lg border p-1 bg-white/60"
                          >
                            <img
                              src={
                                extractImageUrl(img) ||
                                "/placeholder-product.svg"
                              }
                              alt={`img-${i}`}
                              className="h-20 w-28 object-cover rounded-md"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right side - Details */}
              <div className="lg:w-1/2 w-full p-8">
                {detailLoading && (
                  <div className="h-6 bg-gray-100 rounded-md w-48 mb-4" />
                )}

                {!detailLoading && productDetail && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-semibold mb-1 text-slate-900">
                        {productDetail.product_name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {productDetail.category_name || "Uncategorized"} •{" "}
                        {productDetail.business_name || "Unknown vendor"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-3xl font-bold">
                          {formatCurrency(productDetail.price)}
                        </span>
                        {productDetail.cost_price &&
                          Number(productDetail.cost_price) > 0 && (
                            <div className="text-sm line-through text-slate-400">
                              {formatCurrency(productDetail.cost_price)}
                            </div>
                          )}
                      </div>

                      <div className="text-xs text-slate-500">
                        <div>SKU: {productDetail.product_id}</div>
                        {productDetail.barcode && (
                          <div>Barcode: {productDetail.barcode}</div>
                        )}
                        <div>Status: {productDetail.status}</div>
                        <div>
                          Track stock:{" "}
                          {productDetail.track_stock ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>

                    <div className="prose max-w-none text-slate-700">
                      <p>
                        {productDetail.description ||
                          "No description available."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-medium hover:scale-[1.02] transition">
                        Add to cart
                      </button>
                      <a
                        href={`https://api.stoqle.com/api/products/${productDetail.product_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 text-center"
                      >
                        Open in API
                      </a>
                    </div>

                    <div className="text-sm text-slate-600 pt-4 border-t mt-4">
                      {productDetail.variants &&
                      productDetail.variants.length > 0 ? (
                        <div>
                          <div className="font-medium">Variants</div>
                          <ul className="list-disc list-inside mt-2">
                            {productDetail.variants.map((v: any, i: number) => (
                              <li key={i}>{JSON.stringify(v)}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div>No variants available</div>
                      )}

                      <div className="mt-3">
                        {productDetail.inventory &&
                        productDetail.inventory.length > 0 ? (
                          <div className="font-medium">Inventory</div>
                        ) : (
                          <div>No inventory records</div>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-slate-500">
                        Created:{" "}
                        {new Date(productDetail.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {!detailLoading && !productDetail && !detailError && (
                  <div className="text-center text-slate-600">
                    Select a product to see details
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
