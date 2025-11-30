import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { registerArabicFont } from '../utils/pdf/fontConfig';

// Register the Tajawal Arabic font
registerArabicFont();

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Tajawal',
    fontSize: 11,
    textAlign: 'right',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: '3px solid #2c3e50',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  table: {
    display: 'table',
    width: '100%',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottom: '1px solid #ecf0f1',
  },
  tableHeaderRow: {
    backgroundColor: '#34495e',
    color: 'white',
    fontWeight: 700,
    padding: 8,
  },
  tableCol: {
    padding: 5,
    fontSize: 8,
    textAlign: 'right',
    wordWrap: 'break-word',
  },
  tableColText: {
    fontSize: 8,
    lineHeight: 1.3,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    marginTop: 30,
    paddingTop: 15,
    borderTop: '2px solid #95a5a6',
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 9,
  },
});

/**
 * Generic PDF List Document Component
 * @param {String} title - Document title
 * @param {Array} columns - Array of column definitions {key, label, width}
 * @param {Array} data - Array of data objects
 */
const PDFListDocument = ({ title, subtitle, columns, data }) => {
  const currentDate = new Date().toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <Text style={styles.subtitle}>تاريخ الطباعة: {currentDate}</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            {columns.map((col, index) => (
              <View key={index} style={[styles.tableCol, { width: col.width || `${100 / columns.length}%` }]}>
                <Text>{col.label}</Text>
              </View>
            ))}
          </View>

          {/* Table Rows */}
          {data.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {columns.map((col, colIndex) => (
                <View key={colIndex} style={[styles.tableCol, { width: col.width || `${100 / columns.length}%` }]}>
                  <Text style={styles.tableColText}>{row[col.key] || '-'}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>صفحة 1 - تم الإنشاء بواسطة نظام إدارة مكتب المحاماة</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFListDocument;
