// Helper functions for translating status and type labels to Arabic

export const getStatusLabel = (status) => {
  const labels = {
    active: "نشط",
    inactive: "غير نشط",
    archived: "مؤرشف",
    first_instance: "على مستوى الدرجة الأولى",
    in_settlement: "في إطار التسوية",
    closed: "مغلقة",
    in_appeal: "في الاستئناف",
    extraordinary_appeal: "طعن غير عادي",
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
    civil: "المدني",
    social: "الإجتماعي",
    real_estate: "العقاري",
    family: "شؤون الأسرة",
    commercial: "التجاري",
    maritime: "البحري",
    urgent: "الاستعجالي",
    misdemeanor: "الجنح",
    violations: "المخالفات",
    juveniles: "الأحداث",
    penalty_enforcement: "تطبيق العقوبات",
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
    normal: "عادي",
    urgent: "قضاء استعجالي",
  };
  return labels[priority] || priority;
};

export const getClientRoleLabel = (role) => {
  const labels = {
    plaintiff: "مدعي",
    defendant: "مدعى عليه",
    intervening_party: "مدخل في الخصام",
    respondent_after_expertise: "مرجع بعد الخبرة",
    appellant_after_expertise: "مرجع عليه بعد الخبرة",
    appellant: "الطاعن",
    respondent: "المطعون ضده",
  };
  return labels[role] || role;
};

export const getJurisdictionTypeLabel = (type) => {
  const labels = {
    ordinary: "القضاء العادي",
    administrative: "القضاء الإداري",
    commercial: "القضاء التجاري المتخصص",
  };
  return labels[type] || type;
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

export const getSupremeChamberLabel = (chamberType) => {
  const labels = {
    civil: "الغرفة المدنية",
    real_estate: "الغرفة العقارية",
    family: "غرفة شؤون الأسرة والمواريث",
    commercial: "الغرفة التجارية والبحرية",
    social: "الغرفة الاجتماعية",
    criminal: "الغرفة الجنائية",
    misdemeanor: "غرفة الجنح والمخالفات",
  };
  return labels[chamberType] || chamberType;
};
