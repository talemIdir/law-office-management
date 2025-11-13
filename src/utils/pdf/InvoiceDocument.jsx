import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { pdfStyles as styles } from "./pdfStyles";
import { formatDate, formatCurrency } from "../formatters";

/**
 * Invoice PDF Document Component
 * Generates a professional invoice with client info, service description, amounts, and payment status
 */
export const InvoiceDocument = ({
  invoice,
  client,
  caseData,
  payments,
  officeLogo,
}) => {
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
        {/* Header */}
        <View style={styles.header}>
          {officeLogo && (
            <Image
              src={officeLogo}
              style={{
                width: 80,
                height: 80,
                marginBottom: 10,
                objectFit: "contain",
              }}
            />
          )}
          <Text style={styles.title}>فاتورة</Text>
          <Text style={styles.subtitle}>
            رقم الفاتورة: {invoice.invoiceNumber}
          </Text>
        </View>

        {/* Invoice Info and Client Info Side by Side */}
        <View
          style={{ flexDirection: "row-reverse", gap: 15, marginBottom: 20 }}
        >
          {/* Invoice Information */}
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>معلومات الفاتورة</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCol1}>تاريخ الإصدار</Text>
                <Text style={styles.tableCol2}>
                  {formatDate(invoice.invoiceDate)}
                </Text>
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
            <Text style={styles.tableCol1}>
              الضريبة ({taxPercentage}%)
            </Text>
            <Text style={styles.tableCol2}>{formatCurrency(taxAmount)}</Text>
          </View>
          <View style={[styles.tableRow, { backgroundColor: "#3b82f6" }]}>
            <Text
              style={[
                styles.tableCol1,
                { color: "white", fontSize: 12, fontWeight: 800 },
              ]}
            >
              المبلغ الإجمالي
            </Text>
            <Text
              style={[
                styles.tableCol2,
                { color: "white", fontSize: 12, fontWeight: 800 },
              ]}
            >
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
                <Text
                  style={[
                    styles.tableCol2,
                    { color: "#10b981", fontWeight: 700 },
                  ]}
                >
                  {formatCurrency(totalPaid)}
                </Text>
              </View>
              <View style={[styles.tableRow, styles.tableRowEven]}>
                <Text style={styles.tableCol1}>المبلغ المتبقي</Text>
                <Text
                  style={[
                    styles.tableCol2,
                    { color: "#ef4444", fontWeight: 700 },
                  ]}
                >
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
          <Text>
            نظام إدارة مكتب المحاماة - تم إنشاء هذه الفاتورة بتاريخ {currentDate}
          </Text>
          <Text style={{ marginTop: 5, fontSize: 8 }}>
            شكراً لتعاملكم معنا
          </Text>
        </View>
      </Page>
    </Document>
  );
};
