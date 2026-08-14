import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    marginBottom: 20,
  },
  companySection: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 20,
  },
  invoiceDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  invoiceDetailItem: {
    width: '30%',
  },
  label: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  billToSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1 solid #ccc',
    paddingBottom: 5,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  clientDetails: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: '1 solid #ccc',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eee',
    padding: 8,
  },
  tableCell: {
    flex: 1,
  },
  tableCellSmall: {
    width: 60,
    textAlign: 'right',
  },
  tableCellMedium: {
    width: 80,
    textAlign: 'right',
  },
  totalsSection: {
    marginLeft: 'auto',
    width: '40%',
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 9,
    color: '#666',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1 solid #ccc',
  },
  amountInWords: {
    fontSize: 9,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  bankDetails: {
    fontSize: 9,
    marginBottom: 10,
  },
  footer: {
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
    marginTop: 30,
  },
})

interface InvoicePDFProps {
  invoice: any
  company: any
  client: any
  lineItems: any[]
}

export function InvoicePDF({ invoice, company, client, lineItems }: InvoicePDFProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>{company?.company_name || 'Company Name'}</Text>
            <Text style={styles.companyDetails}>{company?.address || ''}</Text>
            <Text style={styles.companyDetails}>{company?.city || ''}, {company?.state || ''} - {company?.pincode || ''}</Text>
            <Text style={styles.companyDetails}>GSTIN: {company?.gstin || 'N/A'}</Text>
            <Text style={styles.companyDetails}>Phone: {company?.phone || 'N/A'}</Text>
            <Text style={styles.companyDetails}>Email: {company?.email || 'N/A'}</Text>
          </View>
          
          <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.invoiceDetailItem}>
            <Text style={styles.label}>Invoice Number</Text>
            <Text style={styles.value}>{invoice.invoice_number}</Text>
          </View>
          <View style={styles.invoiceDetailItem}>
            <Text style={styles.label}>Invoice Date</Text>
            <Text style={styles.value}>{formatDate(invoice.invoice_date)}</Text>
          </View>
          <View style={styles.invoiceDetailItem}>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.value}>{formatDate(invoice.due_date)}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billToSection}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={styles.clientName}>{client.company_name}</Text>
          <Text style={styles.clientDetails}>{client.billing_address || ''}</Text>
          <Text style={styles.clientDetails}>{client.city || ''}, {client.state || ''} - {client.pincode || ''}</Text>
          <Text style={styles.clientDetails}>GSTIN: {client.gstin || 'N/A'}</Text>
          <Text style={styles.clientDetails}>Contact: {client.contact_name || 'N/A'}</Text>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCellSmall}>HSN/SAC</Text>
            <Text style={styles.tableCellSmall}>Qty</Text>
            <Text style={styles.tableCellSmall}>Unit</Text>
            <Text style={styles.tableCellMedium}>Rate</Text>
            <Text style={styles.tableCellMedium}>Amount</Text>
          </View>
          {lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.description}</Text>
              <Text style={styles.tableCellSmall}>{item.hsn_sac_code}</Text>
              <Text style={styles.tableCellSmall}>{item.quantity}</Text>
              <Text style={styles.tableCellSmall}>{item.unit}</Text>
              <Text style={styles.tableCellMedium}>{formatCurrency(item.rate)}</Text>
              <Text style={styles.tableCellMedium}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.cgst_amount > 0 && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>CGST ({invoice.cgst_rate}%)</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.cgst_amount)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>SGST ({invoice.sgst_rate}%)</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.sgst_amount)}</Text>
              </View>
            </>
          )}
          {invoice.igst_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IGST ({invoice.igst_rate}%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.igst_amount)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.total_amount)}</Text>
          </View>
        </View>

        {/* Amount in Words */}
        <Text style={styles.amountInWords}>
          Amount in words: {invoice.total_amount ? (invoice.total_amount * 1).toLocaleString('en-IN') + ' Only' : 'Zero Only'}
        </Text>

        {/* Bank Details */}
        <View style={styles.bankDetails}>
          <Text style={styles.sectionTitle}>Bank Details:</Text>
          <Text>Bank Name: {company?.bank_name || 'N/A'}</Text>
          <Text>Account Number: {company?.account_number || 'N/A'}</Text>
          <Text>IFSC Code: {company?.ifsc_code || 'N/A'}</Text>
          <Text>Account Holder: {company?.account_holder || 'N/A'}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is a computer generated invoice. No signature required.
        </Text>
      </Page>
    </Document>
  )
}
