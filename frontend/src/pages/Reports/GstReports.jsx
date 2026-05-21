import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Download,
  Printer,
  RotateCcw,
  Search,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  getCustomerName,
  getGstAmount,
  getInvoiceDate,
  getInvoiceNo,
  getInvoices,
  getInvoiceTotal,
  getTaxableAmount,
  getBills,
getBillGstAmount,
getBillTaxableAmount,
getBillTotal,
} from "../../utils/reportHelpers";

// const tabs = [
//   { key: "gstr1", label: "GSTR-1" },
//   { key: "gstr2b", label: "GSTR-2B / ITC" },
//   { key: "gstr3b", label: "GSTR-3B Summary" },
//   { key: "hsn", label: "HSN Summary" },
//   { key: "docs", label: "Document Summary" },
//   { key: "download", label: "Download" },
// ];

const tabs = [
  { key: "gstr1", label: "GSTR-1" },
  { key: "gstr2b", label: "GSTR-2B / ITC" },
  { key: "gstr3b", label: "GSTR-3B Summary" },
  { key: "hsn", label: "HSN Summary" },
  { key: "docs", label: "Document Summary" },
  { key: "download", label: "Download" },
];

const b2bInvoices = [
  {
    gstin: "23ABCDE1234F1Z5",
    receiverName: "ABC Traders",
    invoiceNo: "INV-001",
    invoiceDate: "2026-05-11",
    invoiceValue: 12500,
    placeOfSupply: "23-Madhya Pradesh",
    reverseCharge: "N",
    invoiceType: "Regular",
    rate: 18,
    taxableValue: 10593.22,
    igst: 0,
    cgst: 953.39,
    sgst: 953.39,
    cess: 0,
  },
  {
    gstin: "27ABCDE5678K1Z2",
    receiverName: "Metro Sales",
    invoiceNo: "INV-002",
    invoiceDate: "2026-05-10",
    invoiceValue: 8900,
    placeOfSupply: "27-Maharashtra",
    reverseCharge: "N",
    invoiceType: "Regular",
    rate: 18,
    taxableValue: 7542.37,
    igst: 1357.63,
    cgst: 0,
    sgst: 0,
    cess: 0,
  },
];

const b2clInvoices = [
  {
    invoiceNo: "INV-003",
    invoiceDate: "2026-05-09",
    invoiceValue: 25000,
    placeOfSupply: "27-Maharashtra",
    rate: 18,
    taxableValue: 241525.42,
    igst: 43474.58,
    cess: 0,
  },
];

const b2csInvoices = [
  {
    type: "OE",
    placeOfSupply: "23-Madhya Pradesh",
    rate: 18,
    taxableValue: 42000,
    igst: 0,
    cgst: 3780,
    sgst: 3780,
    cess: 0,
  },
];

const creditDebitNotes = [
  {
    noteNo: "CRN-001",
    noteDate: "2026-05-11",
    noteType: "Credit Note",
    originalInvoice: "INV-001",
    gstin: "23ABCDE1234F1Z5",
    taxableValue: 2000,
    rate: 18,
    igst: 0,
    cgst: 180,
    sgst: 180,
    cess: 0,
  },
   {
    noteNo: "DBN-001",
    noteDate: "2026-05-12",
    noteType: "Debit Note",
    originalInvoice: "INV-002",
    gstin: "27ABCDE5678K1Z2",
    taxableValue: 3000,
    rate: 18,
    igst: 540,
    cgst: 0,
    sgst: 0,
    cess: 0,
  },
];

const supplierInvoices = [
  {
    supplierGstin: "23SUPPLIER1234F1Z5",
    supplierName: "Raj Hardware Suppliers",
    invoiceNo: "BILL-001",
    invoiceDate: "2026-05-11",
    invoiceValue: 18500,
    taxableValue: 15677.97,
    igst: 0,
    cgst: 1411.02,
    sgst: 1411.02,
    cess: 0,
    itcAvailable: "Yes",
    matchStatus: "Matched",
  },
  {
    supplierGstin: "27SUPPLIER5678K1Z2",
    supplierName: "Metro Office Solutions",
    invoiceNo: "BILL-002",
    invoiceDate: "2026-05-10",
    invoiceValue: 9200,
    taxableValue: 7796.61,
    igst: 1403.39,
    cgst: 0,
    sgst: 0,
    cess: 0,
    itcAvailable: "Yes",
    matchStatus: "Mismatch",
  },
];

const hsnSummary = [
  {
    supplyType: "B2B",
    hsn: "8471",
    description: "Laptop and computer systems",
    uqc: "NOS",
    quantity: 2,
    taxableValue: 10593.22,
    rate: 18,
    igst: 0,
    cgst: 953.39,
    sgst: 953.39,
    cess: 0,
  },
  {
    supplyType: "B2C",
    hsn: "9401",
    description: "Office chairs",
    uqc: "NOS",
    quantity: 10,
    taxableValue: 42000,
    rate: 18,
    igst: 0,
    cgst: 3780,
    sgst: 3780,
    cess: 0,
  },
];

const documentSummary = [
  {
    nature: "Invoices for outward supply",
    from: "INV-001",
    to: "INV-050",
    total: 50,
    cancelled: 2,
    netIssued: 48,
  },
  {
    nature: "Credit Notes",
    from: "CRN-001",
    to: "CRN-005",
    total: 5,
    cancelled: 0,
    netIssued: 5,
  },
  {
    nature: "Debit Notes",
    from: "DBN-001",
    to: "DBN-003",
    total: 3,
    cancelled: 0,
    netIssued: 3,
  },
];

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

export default function GstReports() {

  const invoices = useSelector((state) => state.invoices?.invoices || []);
const bills = useSelector((state) => state.bills?.bills || []);

const salesReturnsRedux = useSelector(
  (state) =>
    state.salesReturns?.salesReturns ||
    state.salesReturn?.salesReturns ||
    []
);

const creditNotesRedux = useSelector(
  (state) => state.creditNotes?.creditNotes || []
);

const debitNotesRedux = useSelector(
  (state) => state.debitNotes?.debitNotes || []
);
const purchaseReturnsRedux = useSelector(
  (state) =>
    state.purchaseReturns?.returns ||
    state.purchaseReturn?.returns ||
    []
);

const journalEntries = JSON.parse(
  localStorage.getItem("ledgerpro_journal_entries") || "[]"
);

const postedJournalEntries = journalEntries.filter(
  (entry) => entry.status === "Posted"
);

console.log("GST invoices:", invoices);
console.log("GST bills:", bills);

const getInvoiceGSTIN = (invoice) =>
  
  invoice.customerGSTIN ||
  invoice.customerGstin ||
  invoice.gstin ||
  invoice.customerDetails?.gstin ||
  "";
  const isValidGSTIN = (gstin) => {
  const value = String(gstin || "").trim().toUpperCase();

  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value);
};

const getInvoiceItems = (invoice) => invoice.items || [];

const hasInvoiceGST = (invoice) =>
  getInvoiceItems(invoice).some((item) => Number(item.gst || 0) > 0);

const getItemTaxable = (item) => {
  const amount = Number(item.qty || 0) * Number(item.rate || 0);
  const discount = Number(item.discount || 0);
  return Math.max(amount - discount, 0);
};

const getItemTax = (item) =>
  (getItemTaxable(item) * Number(item.gst || 0)) / 100;

const isSameState = (invoice) => {
  const companyProfile =
    JSON.parse(localStorage.getItem("companyProfile")) || {};

  const companyState = companyProfile.state || "Madhya Pradesh";
  const customerState = invoice.customerState || invoice.state || "";

  return String(customerState)
    .toLowerCase()
    .includes(String(companyState).toLowerCase());
};  

const dynamicB2BInvoices = useMemo(() => {
  return invoices
    .filter((invoice) => {
      const gstin = getInvoiceGSTIN(invoice);
      return isValidGSTIN(gstin) && hasInvoiceGST(invoice);
    })
    .map((invoice) => {
      const gst = Number(invoice.gstAmount || getGstAmount(invoice) || 0);
      const taxable = Number(invoice.subtotal || getTaxableAmount(invoice) || 0);
      const total = Number(invoice.amount || invoice.total || getInvoiceTotal(invoice) || 0);
      const sameState = isSameState(invoice);

      return {
        gstin: getInvoiceGSTIN(invoice),
        receiverName: invoice.customer || getCustomerName(invoice),
        invoiceNo: invoice.invoiceNo || getInvoiceNo(invoice),
        invoiceDate: invoice.invoiceDate || getInvoiceDate(invoice),
        invoiceValue: total,
        placeOfSupply: invoice.customerState || invoice.state || "Madhya Pradesh",
        reverseCharge: "N",
        invoiceType: "Regular",
        rate: taxable ? Math.round((gst / taxable) * 100) : 0,
        taxableValue: taxable,
        igst: sameState ? 0 : gst,
        cgst: sameState ? gst / 2 : 0,
        sgst: sameState ? gst / 2 : 0,
        cess: 0,
      };
    });
}, [invoices]);
const dynamicB2CLInvoices = useMemo(() => {
  return invoices
    .filter((invoice) => {
      const gstin = getInvoiceGSTIN(invoice);
      const total = Number(invoice.amount || invoice.total || invoice.grandTotal || 0);

      return (
        !isValidGSTIN(gstin) &&
        hasInvoiceGST(invoice) &&
        !isSameState(invoice) &&
        total > 250000
      );
    })
    .map((invoice) => {
      const gst = Number(invoice.gstAmount || getGstAmount(invoice) || 0);
      const taxable = Number(invoice.subtotal || getTaxableAmount(invoice) || 0);
      const total = Number(invoice.amount || invoice.total || invoice.grandTotal || 0);

      return {
        invoiceNo: invoice.invoiceNo || "-",
        invoiceDate: invoice.invoiceDate || invoice.date || "-",
        invoiceValue: total,
        placeOfSupply: invoice.customerState || invoice.state || "-",
        rate: taxable ? Math.round((gst / taxable) * 100) : 0,
        taxableValue: taxable,
        igst: gst,
        cess: 0,
      };
    });
}, [invoices]);

const dynamicB2CSInvoices = useMemo(() => {
  return invoices
    .filter((invoice) => {
      const gstin = getInvoiceGSTIN(invoice);
      const total = Number(invoice.amount || invoice.total || invoice.grandTotal || 0);

      const isB2CL =
        !isValidGSTIN(gstin) &&
        hasInvoiceGST(invoice) &&
        !isSameState(invoice) &&
        total > 250000;

      return (
        !isValidGSTIN(gstin) &&
        hasInvoiceGST(invoice) &&
        !isB2CL
      );
    })
    .map((invoice) => {
      const gst = Number(invoice.gstAmount || getGstAmount(invoice) || 0);
      const taxable = Number(invoice.subtotal || getTaxableAmount(invoice) || 0);
      const sameState = isSameState(invoice);

     return {
  type: "OE",
  invoiceDate: invoice.invoiceDate || invoice.date || "-",
  placeOfSupply: invoice.customerState || invoice.state || "-",
        rate: taxable ? Math.round((gst / taxable) * 100) : 0,
        taxableValue: taxable,
        igst: sameState ? 0 : gst,
        cgst: sameState ? gst / 2 : 0,
        sgst: sameState ? gst / 2 : 0,
        cess: 0,
      };
    });
}, [invoices]);

const dynamicHsnSummary = useMemo(() => {
  const map = {};

  invoices
    .filter(hasInvoiceGST)
    .forEach((invoice) => {
      const supplyType = getInvoiceGSTIN(invoice) ? "B2B" : "B2C";
      const sameState = isSameState(invoice);

      getInvoiceItems(invoice)
        .filter((item) => Number(item.gst || 0) > 0)
        .forEach((item) => {
          const key = `${supplyType}-${item.hsn || "NA"}-${item.gst || 0}`;
          const taxable = getItemTaxable(item);
          const tax = getItemTax(item);

          if (!map[key]) {
            map[key] = {
              supplyType,
              hsn: item.hsn || "NA",
              description: item.product || "-",
              uqc: "NOS",
              quantity: 0,
              taxableValue: 0,
              rate: Number(item.gst || 0),
              igst: 0,
              cgst: 0,
              sgst: 0,
              cess: 0,
            };
          }

          map[key].quantity += Number(item.qty || 0);
          map[key].taxableValue += taxable;

          if (sameState) {
            map[key].cgst += tax / 2;
            map[key].sgst += tax / 2;
          } else {
            map[key].igst += tax;
          }
        });
    });

  return Object.values(map);
}, [invoices]);

const dynamicDocumentSummary = useMemo(() => {
  const gstInvoices = invoices.filter(hasInvoiceGST);
  const invoiceNos = gstInvoices.map((x) => x.invoiceNo).filter(Boolean);

  return [
    {
      nature: "Invoices for outward supply",
      from: invoiceNos[0] || "-",
      to: invoiceNos[invoiceNos.length - 1] || "-",
      total: invoiceNos.length,
      cancelled: 0,
      netIssued: invoiceNos.length,
    },
    {
      nature: "Credit Notes",
      from: "-",
      to: "-",
      total: 0,
      cancelled: 0,
      netIssued: 0,
    },
    {
      nature: "Debit Notes",
      from: "-",
      to: "-",
      total: 0,
      cancelled: 0,
      netIssued: 0,
    },
  ];
}, [invoices]);

const dynamicSupplierInvoices = useMemo(() => {
  return bills.map((bill) => {

    const gst = getBillGstAmount(bill);
    const taxable = getBillTaxableAmount(bill);

    return {
      supplierGstin: bill.vendorGSTIN || bill.vendorGstin || "Unregistered",
      supplierName: bill.vendor || "Vendor",
      invoiceNo: bill.vendorBillNo || bill.billNo,
      invoiceDate: bill.billDate,
      invoiceValue: getBillTotal(bill),
      taxableValue: taxable,
      igst: 0,
      cgst: gst / 2,
      sgst: gst / 2,
      cess: 0,
      itcAvailable: gst > 0 ? "Yes" : "No",
      matchStatus: "As per Books",
    };
  });
}, [bills]);

  const [activeTab, setActiveTab] = useState("gstr1");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
  const [noteTypeFilter, setNoteTypeFilter] = useState("All");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
   fromDate: "",
toDate: "",
  });

  const handleFromDateChange = (value) => {
    setFromDate(value);

    if (toDate && new Date(toDate) < new Date(value)) {
      setToDate(value);
    }
  };

  const handleToDateChange = (value) => {
    if (fromDate && new Date(value) < new Date(fromDate)) {
      alert("End Date cannot be before Start Date");
      return;
    }

    setToDate(value);
  };

  const generateReport = () => {
    if (new Date(toDate) < new Date(fromDate)) {
      alert("End Date cannot be before Start Date");
      return;
    }

    setAppliedFilters({
      search,
      fromDate,
      toDate,
    });
  };

  const resetFilters = () => {
    setSearch("");
    setFromDate("");
setToDate("");

    setAppliedFilters({
      search: "",
      fromDate: "",
toDate: "",
    });
  };

 const dateMatch = (date) => {
  const current = new Date(date);

  const matchesFrom = appliedFilters.fromDate
    ? current >= new Date(appliedFilters.fromDate)
    : true;

  const matchesTo = appliedFilters.toDate
    ? current <= new Date(appliedFilters.toDate)
    : true;

  return matchesFrom && matchesTo;
};

  const filteredB2B = useMemo(() => {
    return dynamicB2BInvoices.filter((x) => {
      const text = `${x.gstin} ${x.receiverName} ${x.invoiceNo}`.toLowerCase();

      return (
        text.includes(appliedFilters.search.toLowerCase()) &&
        dateMatch(x.invoiceDate)
      );
    });
 }, [appliedFilters, dynamicB2BInvoices]);

 const filteredB2CL = useMemo(() => {
  return dynamicB2CLInvoices.filter((x) => {
    const text = `${x.invoiceNo} ${x.placeOfSupply}`.toLowerCase();

    return (
      text.includes(appliedFilters.search.toLowerCase()) &&
      dateMatch(x.invoiceDate)
    );
  });
}, [appliedFilters, dynamicB2CLInvoices]);

const filteredB2CS = useMemo(() => {
  const map = {};

  dynamicB2CSInvoices
    .filter((x) => {
      const text = `${x.placeOfSupply} ${x.rate}`.toLowerCase();

      return (
        text.includes(appliedFilters.search.toLowerCase()) &&
        dateMatch(x.invoiceDate)
      );
    })
    .forEach((x) => {
      const key = `${x.type}-${x.placeOfSupply}-${x.rate}`;

      if (!map[key]) {
        map[key] = {
          type: x.type,
          placeOfSupply: x.placeOfSupply,
          rate: x.rate,
          taxableValue: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          cess: 0,
        };
      }

      map[key].taxableValue += Number(x.taxableValue || 0);
      map[key].igst += Number(x.igst || 0);
      map[key].cgst += Number(x.cgst || 0);
      map[key].sgst += Number(x.sgst || 0);
      map[key].cess += Number(x.cess || 0);
    });

  return Object.values(map);
}, [appliedFilters, dynamicB2CSInvoices]);

  const filteredSuppliers = useMemo(() => {
    return dynamicSupplierInvoices.filter((x) => {
      const text =
        `${x.supplierGstin} ${x.supplierName} ${x.invoiceNo}`.toLowerCase();

      return (
        text.includes(appliedFilters.search.toLowerCase()) &&
        dateMatch(x.invoiceDate)
      );
    });
 }, [appliedFilters, dynamicSupplierInvoices]);

const creditDebitNotesFromStorage = [
  ...salesReturnsRedux.map((item) => ({
    ...item,
    noteType: "Credit Note",
  })),

  ...creditNotesRedux.map((item) => ({
    ...item,
    noteType: "Credit Note",
  })),

  ...debitNotesRedux.map((item) => ({
    ...item,
    noteType: "Debit Note",
  })),
  ...purchaseReturnsRedux.map((item) => ({
  ...item,
  noteType: "Debit Note",
})),
];

const dynamicCreditDebitNotes = useMemo(() => {
  return creditDebitNotesFromStorage
    .filter((note) => {
      const noteType = note.noteType || note.type || "Credit Note";
      return noteType === "Credit Note" || noteType === "Debit Note";
    })
    .map((note) => {
     const originalInvoiceNo =
  note.invoice ||
  note.invoiceNo ||
  note.originalInvoice ||
  note.billNo ||
  note.vendorBillNo ||
  "-";

  const originalBill = bills.find(
  (bill) =>
    String(bill.billNo || bill.vendorBillNo || bill.id || "") ===
    String(originalInvoiceNo)
);

      const originalInvoice = invoices.find(
        (inv) =>
          String(inv.invoiceNo || inv.id || "") === String(originalInvoiceNo)
      );

      const items = note.items || [];

      const itemSubtotal = items.reduce((sum, item) => {
        return sum + Number(item.qty || 0) * Number(item.rate || 0);
      }, 0);

      const itemGst = items.reduce((sum, item) => {
        const amount = Number(item.qty || 0) * Number(item.rate || 0);
        return sum + (amount * Number(item.gst || 0)) / 100;
      }, 0);

      const total = Number(
        note.total ||
          note.totalAmount ||
          note.returnTotal ||
          note.amount ||
          0
      );

      const gstRate =
        Number(note.gstRate || note.rate || 0) ||
        Number(originalInvoice?.items?.[0]?.gst || 0) ||
        Number(items?.[0]?.gst || 0) ||
        18;

      const taxableValue =
        Number(note.taxableValue || note.subtotal || note.subTotal || 0) ||
        itemSubtotal ||
        (total ? total / (1 + gstRate / 100) : 0);

      const gstAmount =
        Number(note.gstAmount || note.taxAmount || note.tax || note.gst || 0) ||
        itemGst ||
        Math.max(total - taxableValue, 0);

      const sameState = isSameState(originalInvoice || note);

      return {
        noteNo:
          note.returnNo ||
          note.salesReturnNo ||
          note.noteNo ||
          note.creditNoteNo ||
          note.debitNoteNo ||
          note.id ||
          "-",

        noteDate:
          note.date ||
          note.returnDate ||
          note.noteDate ||
          "-",

        noteType: note.noteType || note.type || "Credit Note",

        originalInvoice: originalInvoiceNo,

      gstin:
  note.customerGSTIN ||
  note.customerGstin ||
  note.vendorGSTIN ||
  note.vendorGstin ||
  note.gstin ||
  originalInvoice?.customerGSTIN ||
  originalInvoice?.customerGstin ||
  originalInvoice?.gstin ||
  originalBill?.vendorGSTIN ||
  originalBill?.vendorGstin ||
  originalBill?.gstin ||
  "-",

        taxableValue,

        rate: gstRate,

        igst: sameState ? 0 : gstAmount,
        cgst: sameState ? gstAmount / 2 : 0,
        sgst: sameState ? gstAmount / 2 : 0,
        cess: 0,
      };
    });
}, [creditDebitNotesFromStorage, invoices, bills]);

const filteredCreditDebitNotes = useMemo(() => {
  return dynamicCreditDebitNotes.filter((x) => {
    const text = `${x.noteNo} ${x.originalInvoice} ${x.gstin} ${x.noteType}`.toLowerCase();

    const matchesSearch = text.includes(appliedFilters.search.toLowerCase());

    const matchesDate = dateMatch(x.noteDate);

    const matchesType =
      noteTypeFilter === "All" || x.noteType === noteTypeFilter;

    return matchesSearch && matchesDate && matchesType;
  });
}, [dynamicCreditDebitNotes, appliedFilters, noteTypeFilter]);

const journalGst = useMemo(() => {
  return postedJournalEntries.reduce(
    (acc, entry) => {
      entry.lines.forEach((line) => {
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);

        if (line.account === "GST Payable") {
          acc.outputGst += credit;
          acc.gstPaidOrAdjusted += debit;
        }

        if (line.account === "GST Input Credit") {
          acc.inputGst += debit;
          acc.itcAdjusted += credit;
        }
      });

      return acc;
    },
    {
      outputGst: 0,
      inputGst: 0,
      gstPaidOrAdjusted: 0,
      itcAdjusted: 0,
    }
  );
}, [postedJournalEntries]);
const summary = useMemo(() => {
  const allOutward = [...filteredB2B, ...filteredB2CL, ...filteredB2CS];

  const outwardTaxable = allOutward.reduce(
    (sum, item) => sum + Number(item.taxableValue || 0),
    0
  );

  const outputTaxFromInvoices = allOutward.reduce(
    (sum, item) =>
      sum +
      Number(item.igst || 0) +
      Number(item.cgst || 0) +
      Number(item.sgst || 0) +
      Number(item.cess || 0),
    0
  );

  const itcFromBills = filteredSuppliers.reduce(
    (sum, item) =>
      sum +
      Number(item.igst || 0) +
      Number(item.cgst || 0) +
      Number(item.sgst || 0) +
      Number(item.cess || 0),
    0
  );

  const outputTax = outputTaxFromInvoices + journalGst.outputGst;

  const eligibleItc = itcFromBills + journalGst.inputGst;

  const gstPaidOrAdjusted = journalGst.gstPaidOrAdjusted;

  const itcAdjusted = journalGst.itcAdjusted;

  const netTaxPayable =
    outputTax - eligibleItc - gstPaidOrAdjusted + itcAdjusted;

  return {
    outwardTaxable,
    outputTax,
    eligibleItc,
    gstPaidOrAdjusted,
    itcAdjusted,
    netTaxPayable,
  };
}, [
  filteredB2B,
  filteredB2CL,
  filteredB2CS,
  filteredSuppliers,
  journalGst,
]);

 const gstr3bSummary = [
  {
    table: "3.1(a)",
    description: "Outward taxable supplies",
    taxableValue: summary.outwardTaxable,
    igst: 0,
    cgst: summary.outputTax / 2,
    sgst: summary.outputTax / 2,
    cess: 0,
  },
  {
    table: "4(A)(5)",
    description: "Eligible ITC",
    taxableValue: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0,
  },
  {
    table: "6.1",
    description: "Net cash liability",
    taxableValue: 0,
    igst: 0,
    cgst: summary.netTaxPayable / 2,
    sgst: summary.netTaxPayable / 2,
    cess: 0,
  },
];

  const exportWorkbook = (type) => {
    const wb = XLSX.utils.book_new();

    if (type === "all" || type === "gstr1") {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(filteredB2B),
        "B2B"
      );
      // XLSX.utils.book_append_sheet(
      //   wb,
      //   XLSX.utils.json_to_sheet(filteredB2CL),
      //   "B2CL"
      // );
      // XLSX.utils.book_append_sheet(
      //   wb,
      //   XLSX.utils.json_to_sheet(b2csInvoices),
      //   "B2CS"
      // );
      // XLSX.utils.book_append_sheet(
      //   wb,
      //   XLSX.utils.json_to_sheet(creditDebitNotes),
      //   "CDNR"
      // );
      // XLSX.utils.book_append_sheet(
      //   wb,
      //   XLSX.utils.json_to_sheet(hsnSummary),
      //   "HSN"
      // );
      // XLSX.utils.book_append_sheet(
      //   wb,
      //   XLSX.utils.json_to_sheet(documentSummary),
      //   "DOCS"
      // );
    }

    if (type === "all" || type === "gstr2b") {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(filteredSuppliers),
        "GSTR-2B ITC"
      );
    }

    if (type === "all" || type === "gstr3b") {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(gstr3bSummary),
        "GSTR-3B"
      );
    }

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([buffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, `GST-Reports-${type.toUpperCase()}-May-2026.xlsx`);
  };

  const printReport = () => {
    const printContent = document.getElementById("gst-report-print")?.innerHTML;
    const printWindow = window.open("", "", "width=1200,height=700");

    if (!printWindow || !printContent) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>GST Reports</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #f3f4f6; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black sm:text-3xl">
            <FileSpreadsheet size={30} />
            GST Reports
          </h1>

          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            GSTR-1, GSTR-2B reconciliation, GSTR-3B summary, HSN and document
            reports.
          </p>
        </div>

        <button
          onClick={() => exportWorkbook("all")}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white"
        >
          <Download size={18} />
          Download All Excel
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Report Filters</h2>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="flex items-end">
            <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
              <Search size={18} className="text-[var(--muted)]" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search GSTIN, invoice..."
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) => handleToDateChange(e.target.value)}
          />

          <div className="flex items-end md:col-span-2">
            <button
              onClick={generateReport}
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div id="gst-report-print">
        <div className="summary grid gap-5 md:grid-cols-4">
          <SummaryCard
            title="Outward Taxable"
            value={money(summary.outwardTaxable)}
          />
          <SummaryCard title="Output Tax" value={money(summary.outputTax)} />
          <SummaryCard title="Eligible ITC" value={money(summary.eligibleItc)} />
          <SummaryCard
            title="Net Tax Payable"
            value={money(summary.netTaxPayable)}
          />
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-2xl px-5 py-3 font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "gstr1" && (
          <div className="space-y-6">
            <ReportCard title="GSTR-1: B2B Invoices">
              <SimpleTable
                headers={[
                  "GSTIN",
                  "Receiver",
                  "Invoice",
                  "Date",
                  "Value",
                  "Taxable",
                  "IGST",
                  "CGST",
                  "SGST",
                ]}
                rows={filteredB2B.map((x) => [
                  x.gstin,
                  x.receiverName,
                  x.invoiceNo,
                  x.invoiceDate,
                  money(x.invoiceValue),
                  money(x.taxableValue),
                  money(x.igst),
                  money(x.cgst),
                  money(x.sgst),
                ])}
              />
            </ReportCard>

            <ReportCard title="GSTR-1: B2CL Large Invoices">
              <SimpleTable
                headers={[
                  "Invoice",
                  "Date",
                  "Value",
                  "Place of Supply",
                  "Rate",
                  "Taxable",
                  "IGST",
                ]}
           rows={filteredB2CL.map((x) => [
  x.invoiceNo,
  x.invoiceDate,
  money(x.invoiceValue),
  x.placeOfSupply,
  `${x.rate}%`,
  money(x.taxableValue),
  money(x.igst),
])}
              />
            </ReportCard>

            <ReportCard title="GSTR-1: B2CS Small Supplies">
              <SimpleTable
                headers={[
                  "Type",
                  "Place of Supply",
                  "Rate",
                  "Taxable",
                  "IGST",
                  "CGST",
                  "SGST",
                ]}
               rows={filteredB2CS.map((x) => [
  x.type,
  x.placeOfSupply,
  `${x.rate}%`,
  money(x.taxableValue),
  money(x.igst),
  money(x.cgst),
  money(x.sgst),
])}
              />
            </ReportCard>

            <ReportCard title="GSTR-1: Credit / Debit Notes">

            <div className="mb-4 flex justify-end">
  <select
    value={noteTypeFilter}
    onChange={(e) => setNoteTypeFilter(e.target.value)}
    className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
  >
    <option value="All">All Notes</option>
    <option value="Credit Note">Credit Note</option>
    <option value="Debit Note">Debit Note</option>
  </select>
</div>
              <SimpleTable
                headers={[
                  "Note No",
                  "Date",
                  "Type",
                  "Original Invoice",
                  "GSTIN",
                  "Taxable",
                  "Tax",
                ]}
               rows={filteredCreditDebitNotes.map((x) => [
                  x.noteNo,
                  x.noteDate,
                  x.noteType,
                  x.originalInvoice,
                  x.gstin,
                  money(x.taxableValue),
                  money(x.igst + x.cgst + x.sgst + x.cess),
                ])}
              />
            </ReportCard>
          </div>
        )}

        {activeTab === "gstr2b" && (
          <ReportCard title="GSTR-2B / Purchase ITC Reconciliation">
            <SimpleTable
              headers={[
                "Supplier GSTIN",
                "Supplier",
                "Invoice",
                "Date",
                "Value",
                "Taxable",
                "ITC",
                "Available",
                "Match",
              ]}
              rows={filteredSuppliers.map((x) => [
                x.supplierGstin,
                x.supplierName,
                x.invoiceNo,
                x.invoiceDate,
                money(x.invoiceValue),
                money(x.taxableValue),
                money(x.igst + x.cgst + x.sgst + x.cess),
                x.itcAvailable,
                x.matchStatus,
              ])}
            />
          </ReportCard>
        )}

        {activeTab === "gstr3b" && (
          <ReportCard title="GSTR-3B Summary">
            <SimpleTable
              headers={[
                "Table",
                "Description",
                "Taxable Value",
                "IGST",
                "CGST",
                "SGST",
                "Cess",
              ]}
              rows={gstr3bSummary.map((x) => [
                x.table,
                x.description,
                money(x.taxableValue),
                money(x.igst),
                money(x.cgst),
                money(x.sgst),
                money(x.cess),
              ])}
            />
          </ReportCard>
        )}

        {activeTab === "hsn" && (
          <ReportCard title="HSN Summary">
            <SimpleTable
              headers={[
                "Type",
                "HSN",
                "Description",
                "UQC",
                "Qty",
                "Taxable",
                "Rate",
                "IGST",
                "CGST",
                "SGST",
              ]}
             rows={dynamicHsnSummary.map((x) => [
  x.supplyType,
  x.hsn,
  x.description,
  x.uqc,
  x.quantity,
  money(x.taxableValue),
  `${x.rate}%`,
  money(x.igst),
  money(x.cgst),
  money(x.sgst),
])}
            />
          </ReportCard>
        )}

        {activeTab === "docs" && (
          <ReportCard title="Document Summary">
            <SimpleTable
              headers={["Nature", "From", "To", "Total", "Cancelled", "Net Issued"]}
             rows={dynamicDocumentSummary.map((x) => [
  x.nature,
  x.from,
  x.to,
  x.total,
  x.cancelled,
  x.netIssued,
])}
            />
          </ReportCard>
        )}
      </div>

      {activeTab === "download" && (
        <div className="grid gap-6 md:grid-cols-3">
          <DownloadCard
            title="Download GSTR-1 Excel"
            text="Includes B2B, B2CL, B2CS, CDNR, HSN and document summary sheets."
            onClick={() => exportWorkbook("gstr1")}
          />

          <DownloadCard
            title="Download GSTR-2B Reconciliation"
            text="Includes supplier invoices, ITC available, mismatch and reconciliation data."
            onClick={() => exportWorkbook("gstr2b")}
          />

          <DownloadCard
            title="Download GSTR-3B Summary"
            text="Includes outward supplies, eligible ITC and tax payable summary."
            onClick={() => exportWorkbook("gstr3b")}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Report Actions</h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportWorkbook("all")}
            className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
          >
            <Download size={17} />
            Export Excel
          </button>

          {/* <button
            onClick={printReport}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 font-bold text-white"
          >
            <Printer size={17} />
            Print Report
          </button> */}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", min }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <input
        type={type}
        value={value}
        min={min}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      />
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
      <h3 className="mt-2 text-2xl font-black">{value}</h3>
    </div>
  );
}

function ReportCard({ title, children }) {
  return (
    <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6">
      <h3 className="mb-5 text-lg font-black sm:text-xl">{title}</h3>
      {children}
    </div>
  );
}

function SimpleTable({ headers, rows }) {
  return (
    <>
      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {rows.map((row, rowIndex) => {
          const title = row[1] || row[0] || `Record ${rowIndex + 1}`;
          const subtitle = row[2] || row[3] || "";

          return (
            <div
              key={rowIndex}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
            >
              <div className="mb-4 rounded-2xl bg-[var(--surface-soft)] p-3">
                <p className="font-black text-[var(--text)]">{title}</p>
                {subtitle && (
                  <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {headers.map((header, index) => (
                  <MobileInfo key={header} label={header} value={row[index]} />
                ))}
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
            No records found
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] md:block">
        <table className="w-full min-w-[950px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-5 py-4 text-sm font-black uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-5 py-4 text-sm">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MobileInfo({ label, value }) {
  return (
    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
      <p className="text-xs font-bold uppercase text-[var(--muted)]">{label}</p>

      <p className="mt-1 break-words text-sm font-bold text-[var(--text)]">
        {value || "-"}
      </p>
    </div>
  );
}

function DownloadCard({ title, text, onClick }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h3 className="text-xl font-black">{title}</h3>

      <p className="mt-2 min-h-[70px] text-sm leading-6 text-[var(--muted)]">
        {text}
      </p>

      <button
        onClick={onClick}
        className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white"
      >
        <Download size={17} />
        Download Excel
      </button>
    </div>
  );
}