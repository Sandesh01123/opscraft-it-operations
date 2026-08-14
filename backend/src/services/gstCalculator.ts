interface GSTResult {
  subtotal: number
  cgst_rate: number
  cgst_amount: number
  sgst_rate: number
  sgst_amount: number
  igst_rate: number
  igst_amount: number
  total_amount: number
  gst_type: 'CGST+SGST' | 'IGST'
}

function calculateGST(subtotal: number, isSameState: boolean, gstRate: number = 18): GSTResult {
  if (isSameState) {
    // Intra-state (Karnataka): CGST + SGST
    const cgst_rate = gstRate / 2
    const sgst_rate = gstRate / 2
    const igst_rate = 0
    
    const cgst_amount = Math.round((subtotal * cgst_rate / 100) * 100) / 100
    const sgst_amount = Math.round((subtotal * sgst_rate / 100) * 100) / 100
    const igst_amount = 0
    
    const total_amount = Math.round((subtotal + cgst_amount + sgst_amount) * 100) / 100
    
    return {
      subtotal,
      cgst_rate,
      cgst_amount,
      sgst_rate,
      sgst_amount,
      igst_rate,
      igst_amount,
      total_amount,
      gst_type: 'CGST+SGST'
    }
  } else {
    // Inter-state: IGST
    const cgst_rate = 0
    const sgst_rate = 0
    const igst_rate = gstRate
    
    const cgst_amount = 0
    const sgst_amount = 0
    const igst_amount = Math.round((subtotal * igst_rate / 100) * 100) / 100
    
    const total_amount = Math.round((subtotal + igst_amount) * 100) / 100
    
    return {
      subtotal,
      cgst_rate,
      cgst_amount,
      sgst_rate,
      sgst_amount,
      igst_rate,
      igst_amount,
      total_amount,
      gst_type: 'IGST'
    }
  }
}

function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 9000) + 1000
  return `INV-${year}-${month}-${random}`
}

function amountInWords(amount: number): string {
  if (amount === 0) return 'Zero Only'
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return ''
    
    let result = ''
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred'
      n %= 100
      if (n > 0) result += ' and '
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)]
      n %= 10
      if (n > 0) result += ' ' + ones[n]
    } else if (n > 0) {
      result += ones[n]
    }
    
    return result
  }
  
  function convert(n: number): string {
    if (n === 0) return ''
    
    let result = ''
    
    // Crores
    if (n >= 10000000) {
      const crores = Math.floor(n / 10000000)
      result += convertLessThanThousand(crores) + ' Crore'
      n %= 10000000
      if (n > 0) result += ' '
    }
    
    // Lakhs
    if (n >= 100000) {
      const lakhs = Math.floor(n / 100000)
      result += convertLessThanThousand(lakhs) + ' Lakh'
      n %= 100000
      if (n > 0) result += ' '
    }
    
    // Thousands
    if (n >= 1000) {
      const thousands = Math.floor(n / 1000)
      result += convertLessThanThousand(thousands) + ' Thousand'
      n %= 1000
      if (n > 0) result += ' '
    }
    
    // Hundreds
    if (n > 0) {
      result += convertLessThanThousand(n)
    }
    
    return result
  }
  
  const roundedAmount = Math.round(amount)
  const words = convert(roundedAmount)
  return words.trim() + ' Only'
}

export { calculateGST, generateInvoiceNumber, amountInWords, GSTResult }
