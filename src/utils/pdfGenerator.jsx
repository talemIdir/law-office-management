import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import {
  getStatusLabel,
  getCaseTypeLabel,
  getPaymentMethodLabel,
  getPriorityLabel,
  getClientRoleLabel,
  getSessionTypeLabel,
} from "./labels";
import { formatDate, formatDateTime, formatCurrency } from "./formatters";
import TajawalRegular from "../fonts/Tajawal-Regular.ttf";
import TajawalLight from "../fonts/Tajawal-Light.ttf";
import TajawalMedium from "../fonts/Tajawal-Medium.ttf";
import TajawalBold from "../fonts/Tajawal-Bold.ttf";
import TajawalExtraBold from "../fonts/Tajawal-ExtraBold.ttf";

// Register Tajawal font
Font.register({
  family: "Tajawal",
  fonts: [
    {
      src: TajawalRegular,
      fontWeight: 400,
    },
    {
      src: TajawalLight,
      fontWeight: 300,
    },
    {
      src: TajawalMedium,
      fontWeight: 500,
    },
    {
      src: TajawalBold,
      fontWeight: 700,
    },
    {
      src: TajawalExtraBold,
      fontWeight: 800,
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: "Tajawal",
    fontSize: 11,
    textAlign: "right",
    backgroundColor: "#ffffff",
  },
  decorativeLine: {
    height: 3,
    backgroundColor: "#d4af37",
    marginBottom: 2,
  },
  decorativeLineSecondary: {
    height: 1,
    backgroundColor: "#1a1a2e",
    marginBottom: 20,
  },
  header: {
    textAlign: "center",
    marginBottom: 25,
    paddingBottom: 20,
    borderBottom: "2px solid #d4af37",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  logo: {
    width: 100,
    height: 100,
    objectFit: "contain",
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: "#1a1a2e",
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 500,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1a1a2e",
    backgroundColor: "#f3f4f6",
    padding: 10,
    marginTop: 18,
    marginBottom: 12,
    textAlign: "right",
    borderRight: "4px solid #d4af37",
  },
  table: {
    display: "table",
    width: "100%",
    marginBottom: 15,
    border: "1px solid #e5e7eb",
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottom: "1px solid #e5e7eb",
  },
  tableRowEven: {
    backgroundColor: "#fafafa",
  },
  tableCol1: {
    width: "35%",
    padding: 10,
    fontWeight: 700,
    backgroundColor: "#fafafa",
    color: "#1a1a2e",
    fontSize: 10,
    textAlign: "right",
    borderLeft: "2px solid #e5e7eb",
  },
  tableCol2: {
    width: "65%",
    padding: 10,
    fontSize: 10,
    textAlign: "right",
    color: "#374151",
  },
  dataTable: {
    display: "table",
    width: "100%",
    marginBottom: 15,
    fontSize: 9,
    border: "1px solid #e5e7eb",
    borderRadius: 4,
  },
  dataTableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#1a1a2e",
    color: "white",
    fontWeight: 700,
    padding: 10,
    borderBottom: "2px solid #d4af37",
  },
  dataTableRow: {
    flexDirection: "row-reverse",
    borderBottom: "1px solid #ddd",
    padding: 6,
  },
  dataTableRowEven: {
    backgroundColor: "#f8f9fa",
  },
  dataTableCell: {
    fontSize: 8,
    textAlign: "right",
  },
  textSection: {
    backgroundColor: "#fafafa",
    padding: 14,
    borderRight: "4px solid #d4af37",
    marginBottom: 15,
    fontSize: 10,
    lineHeight: 1.8,
    textAlign: "right",
    borderRadius: 4,
  },
  totalRow: {
    backgroundColor: "#10b981",
    color: "white",
    fontWeight: 700,
    padding: 12,
    marginTop: 10,
    fontSize: 12,
    textAlign: "right",
    borderRadius: 4,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "2px solid #d4af37",
    textAlign: "center",
    color: "#6b7280",
    fontSize: 9,
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
  },
  badge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 700,
  },
});

// PDF Document Component
const CaseReportDocument = ({ caseData, client, courtSessions, payments, officeLogo }) => {
  const currentDate = new Date().toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clientName = client
    ? client.type === "company"
      ? client.companyName
      : `${client.firstName} ${client.lastName}`
    : "-";

  const totalPayments = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Decorative Header Lines */}
        <View style={styles.decorativeLine} />
        <View style={styles.decorativeLineSecondary} />

        {/* Header */}
        <View style={styles.header}>
          {officeLogo && (
            <View style={styles.logoContainer}>
              <Image src={officeLogo} style={styles.logo} />
            </View>
          )}
          <Text style={styles.title}>تقرير القضية</Text>
          <Text style={styles.subtitle}>تاريخ التقرير: {currentDate}</Text>
        </View>

        {/* Client Information */}
        {client && (
          <>
            <Text style={styles.sectionTitle}>معلومات الموكل</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol1}>الاسم</Text>
                <Text style={styles.tableCol2}>{clientName}</Text>
              </View>
              <View style={[styles.tableRow, styles.tableRowEven]}>
                <Text style={styles.tableCol1}>النوع</Text>
                <Text style={styles.tableCol2}>
                  {client.type === "company" ? "شركة" : "فرد"}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol1}>البريد الإلكتروني</Text>
                <Text style={styles.tableCol2}>{client.email || "-"}</Text>
              </View>
              <View style={[styles.tableRow, styles.tableRowEven]}>
                <Text style={styles.tableCol1}>الهاتف</Text>
                <Text style={styles.tableCol2}>{client.phone || "-"}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol1}>العنوان</Text>
                <Text style={styles.tableCol2}>{client.address || "-"}</Text>
              </View>
            </View>
          </>
        )}

        {/* Case Information */}
        <Text style={styles.sectionTitle}>معلومات القضية</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>رقم القضية</Text>
            <Text style={styles.tableCol2}>{caseData.caseNumber || "-"}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.tableCol1}>عنوان القضية</Text>
            <Text style={styles.tableCol2}>{caseData.title || "-"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>نوع القضية</Text>
            <Text style={styles.tableCol2}>
              {getCaseTypeLabel(caseData.caseType) || "-"}
            </Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.tableCol1}>الحالة</Text>
            <Text style={styles.tableCol2}>
              {getStatusLabel(caseData.status) || "-"}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>الأولوية</Text>
            <Text style={styles.tableCol2}>
              {getPriorityLabel(caseData.priority) || "-"}
            </Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.tableCol1}>المحكمة</Text>
            <Text style={styles.tableCol2}>{caseData.court || "-"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>الجهة القضائية</Text>
            <Text style={styles.tableCol2}>{caseData.courtType || "-"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>صفة الموكل</Text>
            <Text style={styles.tableCol2}>
              {getClientRoleLabel(caseData.clientRole)}
            </Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.tableCol1}>الخصم</Text>
            <Text style={styles.tableCol2}>
              {caseData.opposingParty || "-"}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>محامي الخصم</Text>
            <Text style={styles.tableCol2}>
              {caseData.opposingLawyer || "-"}
            </Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.tableCol1}>تاريخ البدء</Text>
            <Text style={styles.tableCol2}>
              {formatDate(caseData.startDate)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>تاريخ الانتهاء</Text>
            <Text style={styles.tableCol2}>{formatDate(caseData.endDate)}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.tableCol1}>الأتعاب المتفق عليها</Text>
            <Text style={styles.tableCol2}>
              {formatCurrency(caseData.amount)}
            </Text>
          </View>
        </View>

        {/* Description */}
        {caseData.description && (
          <>
            <Text style={styles.sectionTitle}>وصف القضية</Text>
            <View style={styles.textSection}>
              <Text>{caseData.description}</Text>
            </View>
          </>
        )}

        {/* Notes */}
        {caseData.notes && (
          <>
            <Text style={styles.sectionTitle}>ملاحظات</Text>
            <View style={styles.textSection}>
              <Text>{caseData.notes}</Text>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            نظام إدارة مكتب المحاماة - تم إنشاء هذا التقرير بتاريخ {currentDate}
          </Text>
        </View>
      </Page>

      {/* Second Page for Sessions and Payments */}
      {(courtSessions.length > 0 || payments.length > 0) && (
        <Page size="A4" style={styles.page}>
          {/* Court Sessions */}
          {courtSessions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                الجلسات ({courtSessions.length})
              </Text>
              <View style={styles.dataTable}>
                <View style={styles.dataTableHeader}>
                  <Text style={[styles.dataTableCell, { width: "20%" }]}>
                    التاريخ
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "15%" }]}>
                    النوع
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "20%" }]}>
                    المحكمة
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "20%" }]}>
                    الحالة
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "15%" }]}>
                    النتيجة
                  </Text>
                </View>
                {courtSessions.map((session, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dataTableRow,
                      index % 2 === 0 && styles.dataTableRowEven,
                    ]}
                  >
                    <Text style={[styles.dataTableCell, { width: "20%" }]}>
                      {formatDateTime(session.sessionDate)}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "15%" }]}>
                      {getSessionTypeLabel(session.sessionType) || "-"}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "20%" }]}>
                      {session.court || "-"}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "20%" }]}>
                      {getStatusLabel(session.status) || "-"}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "15%" }]}>
                      {session.outcome || "-"}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Payments */}
          {payments.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                المدفوعات ({payments.length})
              </Text>
              <View style={styles.dataTable}>
                <View style={styles.dataTableHeader}>
                  <Text style={[styles.dataTableCell, { width: "20%" }]}>
                    التاريخ
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "20%" }]}>
                    المبلغ
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "20%" }]}>
                    الطريقة
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "20%" }]}>
                    المرجع
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "20%" }]}>
                    ملاحظات
                  </Text>
                </View>
                {payments.map((payment, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dataTableRow,
                      index % 2 === 0 && styles.dataTableRowEven,
                    ]}
                  >
                    <Text style={[styles.dataTableCell, { width: "20%" }]}>
                      {formatDate(payment.paymentDate)}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "20%" }]}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "20%" }]}>
                      {getPaymentMethodLabel(payment.paymentMethod) || "-"}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "20%" }]}>
                      {payment.reference || "-"}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "20%" }]}>
                      {payment.notes || "-"}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.totalRow}>
                <Text>اجمالي المدفوعات: {formatCurrency(totalPayments)}</Text>
              </View>
            </>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text>
              نظام إدارة مكتب المحاماة - تم إنشاء هذا التقرير بتاريخ{" "}
              {currentDate}
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

// Invoice PDF Document Component
const InvoiceDocument = ({ invoice, client, caseData, payments, officeLogo }) => {
  const currentDate = new Date().toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clientName = client
    ? client.type === "company"
      ? client.companyName
      : `${client.firstName} ${client.lastName}`
    : "-";

  const clientAddress = client?.address || "-";
  const clientPhone = client?.phone || "-";

  // Calculate amounts from case
  const baseAmount = caseData ? parseFloat(caseData.amount || 0) : 0;
  const taxPercentage = parseFloat(invoice.taxPercentage || 0);
  const taxAmount = (baseAmount * taxPercentage) / 100;
  const totalAmount = baseAmount + taxAmount;

  // Calculate total paid from payments
  const totalPaid = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  );
  const remainingAmount = totalAmount - totalPaid;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Decorative Header Lines */}
        <View style={styles.decorativeLine} />
        <View style={styles.decorativeLineSecondary} />

        {/* Header */}
        <View style={styles.header}>
          {officeLogo && (
            <View style={styles.logoContainer}>
              <Image src={officeLogo} style={styles.logo} />
            </View>
          )}
          <Text style={styles.title}>فاتورة</Text>
          <Text style={styles.subtitle}>رقم الفاتورة: {invoice.invoiceNumber}</Text>
        </View>

        {/* Invoice Info and Client Info Side by Side */}
        <View style={{ flexDirection: "row-reverse", gap: 15, marginBottom: 20 }}>
          {/* Invoice Information */}
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>معلومات الفاتورة</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol1}>تاريخ الإصدار</Text>
                <Text style={styles.tableCol2}>{formatDate(invoice.invoiceDate)}</Text>
              </View>
              {caseData && (
                <View style={[styles.tableRow, styles.tableRowEven]}>
                  <Text style={styles.tableCol1}>رقم القضية</Text>
                  <Text style={styles.tableCol2}>{caseData.caseNumber}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Client Information */}
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>معلومات الموكل</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol1}>الاسم</Text>
                <Text style={styles.tableCol2}>{clientName}</Text>
              </View>
              <View style={[styles.tableRow, styles.tableRowEven]}>
                <Text style={styles.tableCol1}>الهاتف</Text>
                <Text style={styles.tableCol2}>{clientPhone}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol1}>العنوان</Text>
                <Text style={styles.tableCol2}>{clientAddress}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description/Services */}
        {invoice.description && (
          <>
            <Text style={styles.sectionTitle}>وصف الخدمات</Text>
            <View style={styles.textSection}>
              <Text>{invoice.description}</Text>
            </View>
          </>
        )}

        {/* Amount Details */}
        <Text style={styles.sectionTitle}>تفاصيل المبلغ</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>المبلغ الأساسي</Text>
            <Text style={styles.tableCol2}>{formatCurrency(baseAmount)}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.tableCol1}>الضريبة ({taxPercentage}%)</Text>
            <Text style={styles.tableCol2}>{formatCurrency(taxAmount)}</Text>
          </View>
          <View style={[styles.tableRow, { backgroundColor: "#3b82f6" }]}>
            <Text style={[styles.tableCol1, { color: "white", fontSize: 12, fontWeight: 800 }]}>
              المبلغ الإجمالي
            </Text>
            <Text style={[styles.tableCol2, { color: "white", fontSize: 12, fontWeight: 800 }]}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>

        {/* Payment Status */}
        {totalPaid > 0 && (
          <>
            <Text style={styles.sectionTitle}>حالة الدفع</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol1}>المبلغ المدفوع</Text>
                <Text style={[styles.tableCol2, { color: "#10b981", fontWeight: 700 }]}>
                  {formatCurrency(totalPaid)}
                </Text>
              </View>
              <View style={[styles.tableRow, styles.tableRowEven]}>
                <Text style={styles.tableCol1}>المبلغ المتبقي</Text>
                <Text style={[styles.tableCol2, { color: "#ef4444", fontWeight: 700 }]}>
                  {formatCurrency(remainingAmount)}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Notes */}
        {invoice.notes && (
          <>
            <Text style={styles.sectionTitle}>ملاحظات</Text>
            <View style={styles.textSection}>
              <Text>{invoice.notes}</Text>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>نظام إدارة مكتب المحاماة - تم إنشاء هذه الفاتورة بتاريخ {currentDate}</Text>
          <Text style={{ marginTop: 5, fontSize: 8 }}>شكراً لتعاملكم معنا</Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Generate PDF for invoice with Arabic support using @react-pdf/renderer
 * @param {Object} invoice - Invoice information
 * @param {Object} client - Client information
 * @param {Object} caseData - Optional case information
 * @param {Array} payments - Payments data for the case
 * @param {String} officeLogo - Office logo base64 string (optional)
 */
export const generateInvoicePDF = async (invoice, client, caseData = null, payments = [], officeLogo = null) => {
  try {
    // Create PDF blob
    const blob = await pdf(
      <InvoiceDocument invoice={invoice} client={client} caseData={caseData} payments={payments} officeLogo={officeLogo} />
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
    console.error("Error generating PDF:", error);
    throw error;
  }
};
