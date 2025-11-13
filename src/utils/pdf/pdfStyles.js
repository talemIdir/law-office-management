import { StyleSheet } from "@react-pdf/renderer";

/**
 * Shared PDF styles for Arabic RTL documents
 * Used across all PDF templates (cases, invoices, etc.)
 */
export const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Tajawal",
    fontSize: 11,
    textAlign: "right",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    borderBottom: "3px solid #2c3e50",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: "#7f8c8d",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1f2937",
    backgroundColor: "#e5e7eb",
    padding: 8,
    marginTop: 15,
    marginBottom: 10,
    textAlign: "right",
  },
  table: {
    display: "table",
    width: "100%",
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottom: "1px solid #ecf0f1",
  },
  tableRowEven: {
    backgroundColor: "#f8f9fa",
  },
  tableCol1: {
    width: "35%",
    padding: 8,
    fontWeight: 700,
    backgroundColor: "#f8f9fa",
    color: "#2c3e50",
    fontSize: 10,
    textAlign: "right",
  },
  tableCol2: {
    width: "65%",
    padding: 8,
    fontSize: 10,
    textAlign: "right",
  },
  dataTable: {
    display: "table",
    width: "100%",
    marginBottom: 15,
    fontSize: 9,
  },
  dataTableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#34495e",
    color: "white",
    fontWeight: 700,
    padding: 8,
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
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRight: "4px solid #3498db",
    marginBottom: 15,
    fontSize: 10,
    lineHeight: 1.8,
    textAlign: "right",
  },
  totalRow: {
    backgroundColor: "#2ecc71",
    color: "white",
    fontWeight: 700,
    padding: 10,
    marginTop: 10,
    fontSize: 12,
    textAlign: "right",
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "2px solid #95a5a6",
    textAlign: "center",
    color: "#7f8c8d",
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
