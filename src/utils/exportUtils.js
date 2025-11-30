import * as XLSX from 'xlsx';
import { pdf } from '@react-pdf/renderer';

// Helper function to format amounts for display
const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '';
  // Format with space as thousand separator and 2 decimal places
  const formatted = Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return formatted + ' دج';
};

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Name of the file (without extension)
 * @param {String} sheetName - Name of the sheet
 */
export const exportToExcel = (data, fileName = 'export', sheetName = 'Sheet1') => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate and download file
    XLSX.writeFile(wb, `${fileName}.xlsx`);

    return { success: true };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export data to PDF file using @react-pdf/renderer
 * @param {React.Component} PDFComponent - React PDF component
 * @param {String} fileName - Name of the file (without extension)
 */
export const exportToPDF = async (PDFComponent, fileName = 'export') => {
  try {
    // Generate PDF blob
    const blob = await pdf(PDFComponent).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Format client data for Excel export (ALL fields)
 * @param {Array} clients - Array of client objects
 * @returns {Array} Formatted data for Excel
 */
export const formatClientsForExcel = (clients) => {
  return clients.map(client => {
    if (client.type === 'company') {
      return {
        'النوع': 'شركة',
        'اسم الشركة': client.companyName || '',
        'الرقم الوطني': client.nationalId || '',
        'الرقم الجبائي': client.taxId || '',
        'الهاتف': client.phone || '',
        'البريد الإلكتروني': client.email || '',
        'العنوان': client.address || '',
        'المدينة': client.city || '',
        'الولاية': client.wilaya || '',
        'الحالة': client.status === 'active' ? 'نشط' : 'غير نشط',
        'الملاحظات': client.notes || '',
      };
    } else {
      return {
        'النوع': 'فرد',
        'الاسم': client.firstName || '',
        'اللقب': client.lastName || '',
        'الرقم الوطني': client.nationalId || '',
        'الهاتف': client.phone || '',
        'البريد الإلكتروني': client.email || '',
        'العنوان': client.address || '',
        'المدينة': client.city || '',
        'الولاية': client.wilaya || '',
        'الحالة': client.status === 'active' ? 'نشط' : 'غير نشط',
        'الملاحظات': client.notes || '',
      };
    }
  });
};

/**
 * Format client data for PDF export (Essential fields only)
 * @param {Array} clients - Array of client objects
 * @returns {Array} Formatted data for PDF
 */
export const formatClientsForPDF = (clients) => {
  return clients.map(client => {
    if (client.type === 'company') {
      return {
        'اسم الشركة': client.companyName || '',
        'الرقم الوطني': client.nationalId || '',
        'الهاتف': client.phone || '',
        'البريد الإلكتروني': client.email || '',
        'المدينة': client.city || '',
        'الحالة': client.status === 'active' ? 'نشط' : 'غير نشط',
      };
    } else {
      return {
        'الاسم الكامل': `${client.firstName || ''} ${client.lastName || ''}`.trim(),
        'الرقم الوطني': client.nationalId || '',
        'الهاتف': client.phone || '',
        'البريد الإلكتروني': client.email || '',
        'المدينة': client.city || '',
        'الحالة': client.status === 'active' ? 'نشط' : 'غير نشط',
      };
    }
  });
};

/**
 * Format cases data for Excel export (ALL fields)
 * @param {Array} cases - Array of case objects
 * @returns {Array} Formatted data for Excel
 */
export const formatCasesForExcel = (cases) => {
  return cases.map(c => ({
    'رقم القضية': c.caseNumber || '',
    'العنوان': c.title || '',
    'نوع القضية': getCaseTypeLabel(c.caseType),
    'المحكمة': c.court || '',
    'نوع المحكمة': c.courtType || '',
    'القاضي': c.judge || '',
    'الموكل': c.client ? (c.client.type === 'company' ? c.client.companyName : `${c.client.firstName} ${c.client.lastName}`) : '',
    'الطرف المقابل': c.opposingParty || '',
    'محامي الطرف المقابل': c.opposingLawyer || '',
    'صفة الموكل': c.clientRole === 'plaintiff' ? 'مدعي' : 'مدعى عليه',
    'الحالة': getCaseStatusLabel(c.status),
    'الأولوية': getPriorityLabel(c.priority),
    'تاريخ البداية': c.startDate ? new Date(c.startDate).toLocaleDateString('ar-DZ') : '',
    'تاريخ الانتهاء': c.endDate ? new Date(c.endDate).toLocaleDateString('ar-DZ') : '',
    'الأتعاب': c.amount || '',
    'الوصف': c.description || '',
    'الملاحظات': c.notes || '',
  }));
};

/**
 * Format cases data for PDF export (Essential fields only)
 * @param {Array} cases - Array of case objects
 * @returns {Array} Formatted data for PDF
 */
export const formatCasesForPDF = (cases) => {
  return cases.map(c => ({
    'رقم القضية': c.caseNumber || '',
    'العنوان': c.title || '',
    'نوع القضية': getCaseTypeLabel(c.caseType),
    'المحكمة': c.court || '',
    'الموكل': c.client ? (c.client.type === 'company' ? c.client.companyName : `${c.client.firstName} ${c.client.lastName}`) : '',
    'الطرف المقابل': c.opposingParty || '',
    'الحالة': getCaseStatusLabel(c.status),
  }));
};

/**
 * Format appointments data for Excel export (ALL fields)
 * @param {Array} appointments - Array of appointment objects
 * @returns {Array} Formatted data for Excel
 */
export const formatAppointmentsForExcel = (appointments) => {
  return appointments.map(appointment => ({
    'العنوان': appointment.title || '',
    'الموكل': appointment.client ? (appointment.client.type === 'company' ? appointment.client.companyName : `${appointment.client.firstName} ${appointment.client.lastName}`) : '',
    'القضية': appointment.case ? appointment.case.caseNumber : '',
    'التاريخ': appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString('ar-DZ') : '',
    'الوقت': appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }) : '',
    'المدة (دقيقة)': appointment.duration || '',
    'المكان': appointment.location || '',
    'النوع': getAppointmentTypeLabel(appointment.appointmentType),
    'الحالة': getAppointmentStatusLabel(appointment.status),
    'الملاحظات': appointment.notes || '',
  }));
};

/**
 * Format appointments data for PDF export (Essential fields only)
 * @param {Array} appointments - Array of appointment objects
 * @returns {Array} Formatted data for PDF
 */
export const formatAppointmentsForPDF = (appointments) => {
  return appointments.map(appointment => {
    let dateStr = '';
    let timeStr = '';
    if (appointment.appointmentDate) {
      const date = new Date(appointment.appointmentDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
      timeStr = `${hours}:${minutes}`;
    }

    return {
      'العنوان': appointment.title || '',
      'الموكل': appointment.client ? (appointment.client.type === 'company' ? appointment.client.companyName : `${appointment.client.firstName} ${appointment.client.lastName}`) : '',
      'التاريخ': dateStr,
      'الوقت': timeStr,
      'المدة (دقيقة)': appointment.duration || '',
      'المكان': appointment.location || '',
      'الحالة': getAppointmentStatusLabel(appointment.status),
    };
  });
};

/**
 * Format court sessions data for Excel export (ALL fields)
 * @param {Array} sessions - Array of court session objects
 * @returns {Array} Formatted data for Excel
 */
export const formatCourtSessionsForExcel = (sessions) => {
  return sessions.map(session => ({
    'القضية': session.case ? session.case.caseNumber : '',
    'عنوان القضية': session.case ? session.case.title : '',
    'التاريخ': session.sessionDate ? new Date(session.sessionDate).toLocaleDateString('ar-DZ') : '',
    'الوقت': session.sessionDate ? new Date(session.sessionDate).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }) : '',
    'المحكمة': session.court || '',
    'القاعة': session.courtRoom || '',
    'القاضي': session.judge || '',
    'الحالة': session.status || '',
    'الحاضرون': session.attendees || '',
    'النتيجة': session.outcome || '',
    'الملاحظات': session.notes || '',
  }));
};

/**
 * Format court sessions data for PDF export (Essential fields only)
 * @param {Array} sessions - Array of court session objects
 * @returns {Array} Formatted data for PDF
 */
export const formatCourtSessionsForPDF = (sessions) => {
  return sessions.map(session => {
    let dateTimeStr = '';
    if (session.sessionDate) {
      const date = new Date(session.sessionDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      dateTimeStr = `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    return {
      'القضية': session.case ? session.case.caseNumber : '',
      'التاريخ والوقت': dateTimeStr,
      'المحكمة': session.court || '',
      'القاضي': session.judge || '',
      'النوع': session.sessionType || '',
      'الحالة': session.status || '',
    };
  });
};

/**
 * Format invoices data for Excel export (ALL fields)
 * @param {Array} invoices - Array of invoice objects
 * @returns {Array} Formatted data for Excel
 */
export const formatInvoicesForExcel = (invoices) => {
  return invoices.map(invoice => ({
    'رقم الفاتورة': invoice.invoiceNumber || '',
    'الموكل': invoice.client ? (invoice.client.type === 'company' ? invoice.client.companyName : `${invoice.client.firstName} ${invoice.client.lastName}`) : '',
    'القضية': invoice.case ? invoice.case.caseNumber : '',
    'التاريخ': invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('ar-DZ') : '',
    'المبلغ': formatAmount(invoice.amount),
    'الوصف': invoice.description || '',
    'نسبة الضريبة %': invoice.taxPercentage || '0',
    'حالة الدفع': invoice.paymentStatus || '',
    'الملاحظات': invoice.notes || '',
  }));
};

/**
 * Format invoices data for PDF export (Essential fields only)
 * @param {Array} invoices - Array of invoice objects
 * @returns {Array} Formatted data for PDF
 */
export const formatInvoicesForPDF = (invoices) => {
  return invoices.map(invoice => {
    let dateStr = '';
    if (invoice.invoiceDate) {
      const date = new Date(invoice.invoiceDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }

    return {
      'رقم الفاتورة': invoice.invoiceNumber || '',
      'الموكل': invoice.client ? (invoice.client.type === 'company' ? invoice.client.companyName : `${invoice.client.firstName} ${invoice.client.lastName}`) : '',
      'القضية': invoice.case ? invoice.case.caseNumber : '',
      'التاريخ': dateStr,
      'المبلغ': formatAmount(invoice.amount),
      'الحالة': invoice.paymentStatus || '',
    };
  });
};

/**
 * Format expenses data for Excel export (ALL fields)
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Formatted data for Excel
 */
export const formatExpensesForExcel = (expenses) => {
  return expenses.map(expense => ({
    'التاريخ': expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString('ar-DZ') : '',
    'الفئة': getExpenseCategoryLabel(expense.category),
    'الوصف': expense.description || '',
    'المبلغ': formatAmount(expense.amount),
    'طريقة الدفع': getPaymentMethodLabel(expense.paymentMethod),
    'القضية': expense.case ? expense.case.caseNumber : '',
    'المرجع': expense.reference || '',
    'الملاحظات': expense.notes || '',
  }));
};

/**
 * Format expenses data for PDF export (Essential fields only)
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Formatted data for PDF
 */
export const formatExpensesForPDF = (expenses) => {
  return expenses.map(expense => {
    let dateStr = '';
    if (expense.expenseDate) {
      const date = new Date(expense.expenseDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }

    return {
      'التاريخ': dateStr,
      'الفئة': getExpenseCategoryLabel(expense.category),
      'الوصف': expense.description || '',
      'المبلغ': formatAmount(expense.amount),
      'طريقة الدفع': getPaymentMethodLabel(expense.paymentMethod),
      'القضية': expense.case ? expense.case.caseNumber : '',
    };
  });
};

/**
 * Format documents data for Excel export (ALL fields)
 * @param {Array} documents - Array of document objects
 * @returns {Array} Formatted data for Excel
 */
export const formatDocumentsForExcel = (documents) => {
  return documents.map(doc => ({
    'العنوان': doc.title || '',
    'النوع': getDocumentTypeLabel(doc.documentType),
    'الموكل': doc.client ? (doc.client.type === 'company' ? doc.client.companyName : `${doc.client.firstName} ${doc.client.lastName}`) : '',
    'القضية': doc.case ? doc.case.caseNumber : '',
    'اسم الملف': doc.fileName || '',
    'حجم الملف (KB)': doc.fileSize ? Math.round(doc.fileSize / 1024) : '',
    'تاريخ الرفع': doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('ar-DZ') : (doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('ar-DZ') : ''),
    'الوصف': doc.description || '',
    'الملاحظات': doc.notes || '',
  }));
};

/**
 * Format documents data for PDF export (Essential fields only)
 * @param {Array} documents - Array of document objects
 * @returns {Array} Formatted data for PDF
 */
export const formatDocumentsForPDF = (documents) => {
  return documents.map(doc => {
    let dateStr = '';
    if (doc.uploadDate) {
      const date = new Date(doc.uploadDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    } else if (doc.createdAt) {
      const date = new Date(doc.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }

    return {
      'العنوان': doc.title || '',
      'النوع': getDocumentTypeLabel(doc.documentType),
      'الموكل': doc.client ? (doc.client.type === 'company' ? doc.client.companyName : `${doc.client.firstName} ${doc.client.lastName}`) : '',
      'القضية': doc.case ? doc.case.caseNumber : '',
      'تاريخ الإضافة': dateStr,
      'اسم الملف': doc.fileName || '',
    };
  });
};

// Helper functions for labels
const getCaseTypeLabel = (type) => {
  const labels = {
    civil: 'مدني',
    criminal: 'جنائي',
    commercial: 'تجاري',
    administrative: 'إداري',
    family: 'أسري',
    labor: 'عمالي',
    other: 'أخرى'
  };
  return labels[type] || type;
};

const getCaseStatusLabel = (status) => {
  const labels = {
    first_instance: 'محكمة أول درجة',
    in_appeal: 'في الاستئناف',
    in_cassation: 'في النقض',
    closed: 'مغلقة',
    archived: 'مؤرشفة'
  };
  return labels[status] || status;
};

const getPriorityLabel = (priority) => {
  const labels = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة'
  };
  return labels[priority] || priority;
};

const getAppointmentTypeLabel = (type) => {
  const labels = {
    consultation: 'استشارة',
    meeting: 'اجتماع',
    court: 'جلسة محكمة',
    other: 'أخرى'
  };
  return labels[type] || type;
};

const getAppointmentStatusLabel = (status) => {
  const labels = {
    scheduled: 'مجدول',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    rescheduled: 'معاد جدولته'
  };
  return labels[status] || status;
};

const getExpenseCategoryLabel = (category) => {
  const labels = {
    court_fees: 'رسوم المحكمة',
    transportation: 'نقل',
    documentation: 'توثيق',
    other: 'أخرى'
  };
  return labels[category] || category;
};

const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: 'نقداً',
    check: 'شيك',
    bank_transfer: 'تحويل بنكي',
    credit_card: 'بطاقة ائتمان'
  };
  return labels[method] || method;
};

const getDocumentTypeLabel = (type) => {
  const labels = {
    contract: 'عقد',
    court_filing: 'صك محكمة',
    evidence: 'دليل',
    correspondence: 'مراسلة',
    id_document: 'وثيقة هوية',
    power_of_attorney: 'توكيل',
    other: 'أخرى'
  };
  return labels[type] || type;
};
