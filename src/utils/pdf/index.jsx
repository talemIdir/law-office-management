import { pdf } from "@react-pdf/renderer";
import { registerArabicFont } from "./fontConfig";
import { CaseReportDocument } from "./CaseReportDocument";
import { InvoiceDocument } from "./InvoiceDocument";

// Register Arabic font on module load
registerArabicFont();

/**
 * Generate PDF for case details with Arabic support using @react-pdf/renderer
 * @param {Object} caseData - Case information
 * @param {Object} client - Client information
 * @param {Array} courtSessions - Court sessions data
 * @param {Array} payments - Payments data
 * @param {String} officeLogo - Office logo base64 string (optional)
 */
export const generateCasePDF = async (
  caseData,
  client,
  courtSessions,
  payments,
  officeLogo = null
) => {
  try {
    // Create PDF blob
    const blob = await pdf(
      <CaseReportDocument
        caseData={caseData}
        client={client}
        courtSessions={courtSessions}
        payments={payments}
        officeLogo={officeLogo}
      />
    ).toBlob();

    const fileName = `قضية_${caseData.caseNumber}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Use window focus event to detect when save dialog is closed
    const handleFocus = () => {
      window.removeEventListener("focus", handleFocus);

      // Ask user if they want to open the file after save dialog closes
      const shouldOpen = window.confirm(
        "تم حفظ الملف بنجاح. هل تريد فتح الملف؟"
      );

      if (shouldOpen) {
        // Open PDF in new tab
        window.open(url, "_blank");
      }

      // Clean up the blob URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    };

    // Listen for when window regains focus (after save dialog closes)
    window.addEventListener("focus", handleFocus);
  } catch (error) {
    console.error("Error generating case PDF:", error);
    throw error;
  }
};

/**
 * Generate PDF for invoice with Arabic support using @react-pdf/renderer
 * @param {Object} invoice - Invoice information
 * @param {Object} client - Client information
 * @param {Object} caseData - Optional case information
 * @param {Array} payments - Payments data for the case
 * @param {String} officeLogo - Office logo base64 string (optional)
 */
export const generateInvoicePDF = async (
  invoice,
  client,
  caseData = null,
  payments = [],
  officeLogo = null
) => {
  try {
    // Create PDF blob
    const blob = await pdf(
      <InvoiceDocument
        invoice={invoice}
        client={client}
        caseData={caseData}
        payments={payments}
        officeLogo={officeLogo}
      />
    ).toBlob();

    const fileName = `فاتورة_${invoice.invoiceNumber}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Use window focus event to detect when save dialog is closed
    const handleFocus = () => {
      window.removeEventListener("focus", handleFocus);

      // Ask user if they want to open the file after save dialog closes
      const shouldOpen = window.confirm(
        "تم حفظ الملف بنجاح. هل تريد فتح الملف؟"
      );

      if (shouldOpen) {
        // Open PDF in new tab
        window.open(url, "_blank");
      }

      // Clean up the blob URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    };

    // Listen for when window regains focus (after save dialog closes)
    window.addEventListener("focus", handleFocus);
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    throw error;
  }
};
