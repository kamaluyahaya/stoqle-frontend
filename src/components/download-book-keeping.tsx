interface Transaction {
  date: string
  receipt_no: string
  transaction_type: string
  customer?: string
  sold_by?: string
  payment_method: string
  price: string
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

export const downloadCSV = (transactions: Transaction[] = []) => {
  const user = JSON.parse(localStorage.getItem("user") || "null")
  const businessName = user?.business_name || "My Business"

  // Apple-like clean headers
  const headers = ["Date", "Receipt No", "Transaction Type", "Customer", "Sold By", "Payment Method", "Amount (₦)"]

  // Map transactions into CSV rows
  const rows = transactions.map((t) =>
    [
      `"${formatDate(t.date)}"`,
      `"${t.receipt_no}"`,
      `"${t.transaction_type}"`,
      `"${(t.customer || "").replace(/"/g, '""')}"`,
      `"${(t.sold_by || "").replace(/"/g, '""')}"`,
      `"${t.payment_method}"`,
      `"${t.price}"`,
    ].join(","),
  )

  // Build CSV content
  const csvContent = [
    `"${businessName}"`, // Business name row
    `"Generated: ${new Date().toLocaleString()}"`, // Timestamp row
    "", // Blank line for spacing
    headers.join(","), // Column headers
    ...rows, // Data rows
  ].join("\r\n") // ✅ Excel-friendly line breaks

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${businessName.replace(/\s+/g, "_")}_Bookkeeping_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const downloadSpreadsheetCSV = (data: Record<string, { value: string }>, columns: string[], rows: number) => {
  const headers = columns
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(","))

  // Add data rows
  for (let row = 1; row <= rows; row++) {
    const rowData = headers.map((col) => {
      const key = `${col}${row}`
      const value = data[key]?.value || ""
      return `"${value.replace(/"/g, '""')}"`
    })
    if (rowData.some((cell) => cell !== '""')) {
      // Only add non-empty rows
      csvRows.push(rowData.join(","))
    }
  }

  const csvContent = csvRows.join("\r\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `Professional_Spreadsheet_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
