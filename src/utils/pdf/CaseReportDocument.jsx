import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { pdfStyles as styles } from "./pdfStyles";
import {
  getStatusLabel,
  getCaseTypeLabel,
  getPaymentMethodLabel,
  getPriorityLabel,
  getClientRoleLabel,
} from "../labels";
import { formatDate, formatDateTime, formatCurrency } from "../formatters";

/**
 * Case Report PDF Document Component
 * Generates a comprehensive case report with client info, case details, sessions, and payments
 */
export const CaseReportDocument = ({
  caseData,
  client,
  courtSessions,
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

  const totalPayments = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  );

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
                  <Text style={[styles.dataTableCell, { width: "22%" }]}>
                    التاريخ
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "28%" }]}>
                    المحكمة
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "24%" }]}>
                    الحالة
                  </Text>
                  <Text style={[styles.dataTableCell, { width: "20%" }]}>
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
                    <Text style={[styles.dataTableCell, { width: "22%" }]}>
                      {formatDateTime(session.sessionDate)}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "28%" }]}>
                      {session.court || "-"}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "24%" }]}>
                      {session.status || "-"}
                    </Text>
                    <Text style={[styles.dataTableCell, { width: "20%" }]}>
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
                <Text>إجمالي المدفوعات : {formatCurrency(totalPayments)}</Text>
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
