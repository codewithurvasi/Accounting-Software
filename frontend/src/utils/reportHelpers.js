// ==============================
// BASIC GST HELPERS
// ==============================

export const getTaxableAmount = (qty = 0, rate = 0) => {
  return Number(qty || 0) * Number(rate || 0);
};

export const getGstAmount = (taxableAmount = 0, gstRate = 0) => {
  return (Number(taxableAmount || 0) * Number(gstRate || 0)) / 100;
};

export const getItemTaxableAmount = (item = {}) => {
  return getTaxableAmount(
    item.qty || item.quantity || 0,
    item.rate || item.price || item.salePrice || item.purchasePrice || 0
  );
};

export const getItemGstRate = (item = {}) => {
  return Number(item.gst || item.gstRate || item.tax || item.taxRate || 0);
};

export const getItemGstAmount = (item = {}) => {
  return getGstAmount(getItemTaxableAmount(item), getItemGstRate(item));
};

export const getItemTotal = (item = {}) => {
  return getItemTaxableAmount(item) + getItemGstAmount(item);
};

// ==============================
// INVOICE HELPERS
// ==============================

export const getInvoiceNo = (invoice = {}) => {
  return invoice.invoiceNo || invoice.invoiceNumber || invoice.id || "-";
};

export const getInvoiceDate = (invoice = {}) => {
  return invoice.date || invoice.invoiceDate || invoice.createdAt || "";
};

export const getCustomerName = (invoice = {}) => {
  return invoice.customer || invoice.customerName || invoice.partyName || "Customer";
};

export const getInvoiceTaxableAmount = (invoice = {}) => {
  return (invoice.items || []).reduce(
    (sum, item) => sum + getItemTaxableAmount(item),
    0
  );
};

export const getInvoiceGstAmount = (invoice = {}) => {
  return (invoice.items || []).reduce(
    (sum, item) => sum + getItemGstAmount(item),
    0
  );
};

export const getInvoiceTotal = (invoice = {}) => {
  const savedTotal = Number(invoice.total || invoice.grandTotal || invoice.totalAmount || 0);

  if (savedTotal > 0) return savedTotal;

  return (invoice.items || []).reduce((sum, item) => sum + getItemTotal(item), 0);
};

export const getInvoiceSubTotal = (invoice = {}) => {
  return getInvoiceTaxableAmount(invoice);
};

export const getInvoiceGrandTotal = (invoice = {}) => {
  return getInvoiceTotal(invoice);
};

// ==============================
// BILL HELPERS
// ==============================

export const getBillNo = (bill = {}) => {
  return bill.billNo || bill.billNumber || bill.vendorBillNo || bill.id || "-";
};

export const getBillDate = (bill = {}) => {
  return bill.date || bill.billDate || bill.createdAt || "";
};

export const getVendorName = (bill = {}) => {
  return bill.vendor || bill.vendorName || bill.partyName || "Vendor";
};

export const getBillTaxableAmount = (bill = {}) => {
  return (bill.items || []).reduce(
    (sum, item) => sum + getItemTaxableAmount(item),
    0
  );
};

export const getBillGstAmount = (bill = {}) => {
  return (bill.items || []).reduce(
    (sum, item) => sum + getItemGstAmount(item),
    0
  );
};

export const getBillTotal = (bill = {}) => {
  const savedTotal = Number(bill.total || bill.grandTotal || bill.totalAmount || 0);

  if (savedTotal > 0) return savedTotal;

  return (bill.items || []).reduce((sum, item) => sum + getItemTotal(item), 0);
};

// ==============================
// GST CALCULATION
// ==============================

export const calculateItemValues = (item = {}, companyState = "") => {
  const taxable = getItemTaxableAmount(item);
  const gstAmount = getItemGstAmount(item);

  const partyState =
    item.state || item.customerState || item.vendorState || "";

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (
    companyState &&
    partyState &&
    companyState.toLowerCase() === partyState.toLowerCase()
  ) {
    cgst = gstAmount / 2;
    sgst = gstAmount / 2;
  } else {
    igst = gstAmount;
  }

  return {
    taxable,
    gstAmount,
    cgst,
    sgst,
    igst,
    total: taxable + gstAmount,
  };
};

export const calculateInvoiceTotals = (invoices = [], companyState = "") => {
  return invoices.reduce(
    (acc, invoice) => {
      (invoice.items || []).forEach((item) => {
        const values = calculateItemValues(
          {
            ...item,
            state: invoice.state || invoice.customerState || item.state,
          },
          companyState
        );

        acc.taxable += values.taxable;
        acc.cgst += values.cgst;
        acc.sgst += values.sgst;
        acc.igst += values.igst;
        acc.total += values.total;
      });

      return acc;
    },
    {
      taxable: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
    }
  );
};

export const calculateBillTotals = (bills = [], companyState = "") => {
  return bills.reduce(
    (acc, bill) => {
      (bill.items || []).forEach((item) => {
        const values = calculateItemValues(
          {
            ...item,
            state: bill.state || bill.vendorState || item.state,
          },
          companyState
        );

        acc.taxable += values.taxable;
        acc.cgst += values.cgst;
        acc.sgst += values.sgst;
        acc.igst += values.igst;
        acc.total += values.total;
      });

      return acc;
    },
    {
      taxable: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
    }
  );
};

// ==============================
// REDUX HELPERS
// ==============================

export const getInvoices = (state = {}) => {
  return state.invoices?.invoices || [];
};

export const getBills = (state = {}) => {
  return state.bills?.bills || [];
};

export const getPayments = (state = {}) => {
  return state.payments?.payments || [];
};

export const getCustomers = (state = {}) => {
  return state.customers?.customers || [];
};

export const getVendors = (state = {}) => {
  return state.vendors?.vendors || [];
};

// ==============================
// PAYMENT HELPERS
// ==============================

export const getPaidAmount = (entry = {}) => {
  return Number(entry.paidAmount || entry.amountPaid || entry.payment || 0);
};

export const getDueAmount = (total = 0, paid = 0) => {
  return Number(total || 0) - Number(paid || 0);
};

// ==============================
// FORMAT HELPERS
// ==============================

export const formatCurrency = (amount = 0) => {
  return `₹ ${Number(amount || 0).toFixed(2)}`;
};

export const getInvoiceStatus = (invoice = {}) => {
  return (
    invoice.status ||
    invoice.paymentStatus ||
    "Unpaid"
  );
};

export const getBillStatus = (bill = {}) => {
  return (
    bill.status ||
    bill.paymentStatus ||
    "Unpaid"
  );
};
