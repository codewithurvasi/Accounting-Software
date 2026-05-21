import express from "express";
import cors from "cors";
import translate from "google-translate-api-x";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const cache = new Map();

const fallbackHindi = {
  Dashboard: "डैशबोर्ड",
  Expenses: "खर्चे",
  "Add Expense": "खर्च जोड़ें",
  "Total Expenses": "कुल खर्चे",
  "Taxable Amount": "कर योग्य राशि",
  "GST Amount": "जीएसटी राशि",
  "Cash Expenses": "नकद खर्चे",
  Filters: "फ़िल्टर",
  "Reset Filters": "फ़िल्टर रीसेट करें",
  "Start Date": "प्रारंभ तिथि",
  "End Date": "अंतिम तिथि",
  Category: "श्रेणी",
  "Payment Mode": "भुगतान प्रकार",
  "Export CSV": "CSV निर्यात करें",
  "Expense No": "खर्च संख्या",
  Date: "तारीख",
  Status: "स्थिति",
  Actions: "कार्य",
  Paid: "भुगतान किया गया",
  Unpaid: "भुगतान बाकी",
  Partial: "आंशिक",
  Amount: "राशि",
  Taxable: "कर योग्य",
  Total: "कुल",
  Mode: "माध्यम",
  Bank: "बैंक",
  Reference: "संदर्भ",
  Notes: "नोट्स",

  Sales: "बिक्री",
  Invoices: "चालान",
  "Sales Return": "बिक्री वापसी",
  "Payments Received": "प्राप्त भुगतान",
  "Customer Statement": "ग्राहक स्टेटमेंट",
  Customers: "ग्राहक",
  "Add Customer": "ग्राहक जोड़ें",
  "Create Invoice": "चालान बनाएं",
  "Invoice List": "चालान सूची",
  Customer: "ग्राहक",
  "Invoice No": "चालान संख्या",

  Purchase: "खरीदी",
  Vendors: "विक्रेता",
  Bills: "बिल",
  "Purchase Return": "खरीद वापसी",
  "Payments Made": "किए गए भुगतान",
  "Vendor Statement": "विक्रेता स्टेटमेंट",
  "Add Vendor": "विक्रेता जोड़ें",
  "Total Vendors": "कुल विक्रेता",
  "Active Vendors": "सक्रिय विक्रेता",
  "Total Payable": "कुल देय राशि",

  Inventory: "इन्वेंटरी",
  Accounts: "खाते",
  Reports: "रिपोर्ट्स",
  Settings: "सेटिंग्स",
  Logout: "लॉगआउट",
  Admin: "एडमिन"
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post("/translate-batch", async (req, res) => {
  const { texts = [], lang = "hi" } = req.body;

  try {
    const uniqueTexts = [...new Set(texts.filter(Boolean))];

    const results = [];

    for (const text of uniqueTexts) {
      const cacheKey = `${lang}:${text}`;

      if (cache.has(cacheKey)) {
        results.push({
          original: text,
          translated: cache.get(cacheKey),
        });
        continue;
      }

      try {
        await sleep(700); // Google block avoid karne ke liye delay

        const result = await translate(text, {
          to: lang,
          forceBatch: false,
        });

        cache.set(cacheKey, result.text);

        results.push({
          original: text,
          translated: result.text,
        });
      } catch (error) {
  console.log("Translate skipped:", text);

  results.push({
    original: text,
    translated: fallbackHindi[text] || text,
  });
}
    }

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Batch translate error:", error.message);

    res.json({
      success: false,
      results: [],
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});