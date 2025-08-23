"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { X, Phone, Store, User, Package, Mail, MapPin, CheckCircle, ShoppingCart } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"
import { AnimatePresence, motion } from "framer-motion"
import { ApiProduct } from "../lib/types"
import { toast } from "sonner"
import Input from "@/components/product/customerInput"


// ----------------- OrderForm (internal component) -----------------
export default function OrderForm({ product }: { product: ApiProduct }) {
  const pid = Number(product.product_id ?? product.id ?? 0)

  const [formData, setFormData] = useState({
    product_id: pid,
    productName: product.product_name,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    quantity: 1,
    specialInstructions: "",
  })

  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // keep product id in sync if product changes
    setFormData((prev) => ({ ...prev, product_id: pid, productName: product.product_name }))
  }, [pid, product.product_name])

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.customerName.trim()) newErrors.customerName = "Name is required"
    else if (formData.customerName.trim().length < 2) newErrors.customerName = "Name must be at least 2 characters"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.customerEmail.trim()) newErrors.customerEmail = "Email is required"
    else if (!emailRegex.test(formData.customerEmail)) newErrors.customerEmail = "Please enter a valid email address"

    const phoneRegex = /^[+]?[0-9\s-]{7,}$/
    if (!formData.customerPhone.trim()) newErrors.customerPhone = "Phone number is required"
    else if (!phoneRegex.test(formData.customerPhone.replace(/\s/g, ""))) newErrors.customerPhone = "Please enter a valid phone number"

    if (!formData.customerAddress.trim()) newErrors.customerAddress = "Address is required"
    else if (formData.customerAddress.trim().length < 10) newErrors.customerAddress = "Please provide a complete address"

    if (formData.quantity < 1) newErrors.quantity = "Quantity must be at least 1"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "quantity" ? Number.parseInt(value) || 1 : value }))
    if (errors[name as string]) setErrors((prev: any) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!validateForm()) return

    setIsSubmitting(true)

    const payload = {
      product_id: Number(formData.product_id),
      full_name: formData.customerName,
      email: formData.customerEmail,
      phone: formData.customerPhone,
      delivery_address: formData.customerAddress,
      quantity: Number(formData.quantity),
      special_instruction: formData.specialInstructions || "",
    }

    try {
      const res = await fetch("https://api.stoqle.com/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        // try to read error body
        let text = await res.text()
        try {
          const json = JSON.parse(text)
          text = JSON.stringify(json)
        } catch (err) {
          // keep text as-is
        }
        throw new Error(`Server responded with ${res.status}: ${text}`)
      }

      // success
      // setShowSuccessAlert(true)
         toast.success("✅ Order placed successfully", {position:'top-center'})
      setFormData((prev) => ({ ...prev, customerName: "", customerEmail: "", customerPhone: "", customerAddress: "", quantity: 1, specialInstructions: "" }))
      setTimeout(() => setShowSuccessAlert(false), 4000)
      
    } catch (err: any) {
      console.error("Order submit error:", err)
      toast.error(err?.message ?? "Failed to submit order", {position:'top-center'})
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 md:p-6 mt-6">
      {/* Success Alert */}
      <div
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
          showSuccessAlert ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
          <CheckCircle size={24} className="text-green-100" />
          <div>
            <p className="font-semibold">Order Submitted Successfully!</p>
            <p className="text-sm text-white">We sent your order to the vendor.</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md mb-4 text-sm">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
        <ShoppingCart size={20} className="text-blue-500" />
        Place Order
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden product info */}
        <input type="hidden" name="product_id" value={formData.product_id} />

        <div className="bg-white rounded-md p-3 border border-gray-200">
          <p className="text-sm text-gray-600">Ordering:</p>
          <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
          <p className="text-sm text-blue-600">₦{Number(product.price).toLocaleString()} each</p>
        </div>

<Input
  name="customerName"
  label="Full Name"
  value={formData.customerName}
  onChange={handleInputChange}
/>
{errors.customerName && (
  <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
)}

<Input
  name="customerEmail"
  label="Email Address"
  value={formData.customerEmail}
  onChange={handleInputChange}
/>
{errors.customerEmail && (
  <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
)}

<Input
  name="customerPhone"
  label="Phone Number"
  value={formData.customerPhone}
  onChange={handleInputChange}
/>
{errors.customerPhone && (
  <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
)}

<Input
  name="quantity"
  type="number"
  label="Quantity"
  value={formData.quantity}
  onChange={handleInputChange}
/>
{errors.quantity && (
  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
)}

       
        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1">
            <MapPin size={16} className="inline mr-1" />
            Delivery Address *
          </label>
          <textarea
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleInputChange}
            rows={3}
            className={`peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
            bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
            transition-all duration-300 placeholder-transparent
            focus:border-blue-500 focus:outline-none ${
              errors.customerAddress ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.customerAddress && <p className="text-red-500 text-xs mt-1">{errors.customerAddress}</p>}
        </div>

        {/* Quantity */}
       

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium mb-1">Special Instructions (Optional)</label>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleInputChange}
            rows={2}
            className="peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
            bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
            transition-all duration-300 placeholder-transparent
            focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Total */}
        <div className="bg-white rounded-md p-3 border border-gray-200">
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Total Amount:</span>
            <span className="text-md font-bold text-gray-900">₦{(Number(product.price) * formData.quantity).toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-full text-sm text-white transition-colors ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Processing..." : "Submit Order"}
        </button>
      </form>
    </div>
  )
}
