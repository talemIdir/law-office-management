// Helper functions for translating status and type labels to Arabic

export const getStatusLabel = (status) => {
  const labels = {
    active: "نشط",
    inactive: "غير نشط",
    archived: "مؤرشف",
    open: "مفتوحة",
    in_progress: "قيد المعالجة",
    won: "مكسوبة",
    lost: "مخسورة",
    settled: "مسوّاة",
    closed: "مغلقة",
    appealed: "مستأنفة",
    scheduled: "مجدول",
    completed: "مكتمل",
    cancelled: "ملغى",
    rescheduled: "معاد جدولة",
    pending: "معلق",
    paid: "مدفوع",
    partial: "مدفوع جزئياً",
    overdue: "متأخر",
  };
  return labels[status] || status;
};

export const getAppointmentTypeLabel = (type) => {
  const labels = {
    consultation: "استشارة",
    meeting: "اجتماع",
    court_session: "جلسة محكمة",
    other: "أخرى",
  };
  return labels[type] || type;
};

export const getCaseTypeLabel = (type) => {
  const labels = {
    civil: "مدني",
    criminal: "جنائي",
    commercial: "تجاري",
    family: "أسري",
    labor: "عمالي",
    administrative: "إداري",
    other: "أخرى",
  };
  return labels[type] || type;
};

export const getClientTypeLabel = (type) => {
  const labels = {
    individual: "فرد",
    company: "شركة",
  };
  return labels[type] || type;
};

export const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: "نقدي",
    check: "شيك",
    bank_transfer: "تحويل بنكي",
    credit_card: "بطاقة ائتمان",
    other: "أخرى",
  };
  return labels[method] || method;
};

export const getDocumentTypeLabel = (type) => {
  const labels = {
    contract: "عقد",
    court_filing: "مذكرة محكمة",
    evidence: "دليل",
    correspondence: "مراسلة",
    other: "أخرى",
  };
  return labels[type] || type;
};

export const getPriorityLabel = (priority) => {
  const labels = {
    urgent: "عاجل",
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
  };
  return labels[priority] || priority;
};

export const getClientRoleLabel = (role) => {
  return role === "plaintiff" ? "مدعي" : "مدعى عليه";
};

export const getSessionTypeLabel = (type) => {
  const labels = {
    hearing: "جلسة استماع",
    verdict: "حكم",
    procedural: "إجرائية",
    other: "أخرى",
  };
  return labels[type] || type;
};

export const getExpenseCategoryLabel = (category) => {
  const labels = {
    court_fees: "رسوم المحكمة",
    transportation: "مواصلات",
    documentation: "توثيق",
    office_supplies: "مستلزمات مكتبية",
    utilities: "مرافق",
    salaries: "رواتب",
    other: "أخرى",
  };
  return labels[category] || category;
};
