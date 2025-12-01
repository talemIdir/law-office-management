import {
  sequelize,
  initDatabase,
  Client,
  Case,
  CourtSession,
  Document,
  Invoice,
  Payment,
  Expense,
  Appointment,
  User,
  Setting,
} from "./index.js";

// Algerian Wilayas (provinces)
const algerianWilayas = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
];

// Helper function to get random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to generate random integer between min and max (inclusive)
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to generate random date
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Helper function to generate future date
const futureDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
};

// Helper function to generate past date
const pastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Helper function to generate random date within the past year
const randomDateThisYear = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  return randomDate(startOfYear, now);
};

// Helper function to generate random date within a specific range in days
const randomPastDate = (minDaysAgo, maxDaysAgo) => {
  const daysAgo = randomInt(minDaysAgo, maxDaysAgo);
  return pastDate(daysAgo);
};

// Sample data arrays for generating large datasets
const firstNames = [
  "محمد", "أحمد", "فاطمة", "عائشة", "علي", "حسن", "خديجة", "زينب", "عمر", "يوسف",
  "مريم", "سارة", "إبراهيم", "عبد الله", "رقية", "نور", "خالد", "سعيد", "ليلى", "أمينة",
  "طارق", "وليد", "سلمى", "هدى", "كريم", "رشيد", "نادية", "ياسمين", "عماد", "فريد",
  "زياد", "بلال", "وردة", "هناء", "سمير", "منير", "لطيفة", "حياة", "عصام", "جمال",
  "سعاد", "نبيل", "رضا", "هشام", "سميرة", "فوزية", "رشيدة", "كمال", "جليلة", "صالح"
];

const lastNames = [
  "بن علي", "بن محمد", "بن عمر", "بن يوسف", "بن صالح", "بن حسن", "بن عيسى", "بن إبراهيم",
  "بن خالد", "بن سعيد", "بن مصطفى", "بن رشيد", "بن كريم", "بن طارق", "بن وليد",
  "المحامي", "التاجر", "الموكل", "العميل", "الشخص", "الأستاذ", "الدكتور", "المهندس",
  "الطبيب", "الأستاذة", "المديرة", "السيد", "السيدة", "الموظف", "الموظفة"
];

const companyNames = [
  "شركة النموذج للتجارة", "مؤسسة البناء والأشغال", "شركة التكنولوجيا الحديثة",
  "مؤسسة الخدمات اللوجستية", "شركة الاستيراد والتصدير", "مؤسسة الصناعة والإنتاج",
  "شركة النقل والمواصلات", "مؤسسة التطوير العقاري", "شركة الخدمات الرقمية",
  "مؤسسة الاستشارات", "شركة التجارة الدولية", "مؤسسة التسويق والإعلان",
  "شركة الطاقة المتجددة", "مؤسسة الأغذية والمشروبات", "شركة الصحة والجمال"
];

const caseTypes = ["civil", "criminal", "commercial", "labor", "family", "administrative"];

const caseStatuses = ["first_instance", "in_appeal", "in_supreme_court", "suspended", "closed"];

const priorities = ["low", "medium", "high", "urgent"];

const clientRoles = ["plaintiff", "defendant"];

const courtTypes = ["محكمة ابتدائية", "محكمة الجنايات", "المحكمة التجارية", "محكمة العمل", "محكمة الأسرة"];

const paymentMethods = ["cash", "check", "bank_transfer"];

const appointmentStatuses = ["scheduled", "completed", "cancelled"];

const appointmentTypes = ["consultation", "meeting", "court_hearing"];

const documentTypes = ["contract", "court_filing", "id_document", "evidence", "correspondence"];

const expenseCategories = ["court_fees", "transportation", "documentation", "expert_fees", "other"];

const sessionStatuses = ["في التقرير", "في المرافعة", "لجواب الخصم", "لجوابنا", "جلسة المحاكمة", "في المداولة", "مؤجلة"];

// Cleanup function - deletes all data in correct order (respecting foreign keys)
async function cleanupDatabase() {
  console.log("🧹 Cleaning up existing data...");

  try {
    // Delete in reverse order of dependencies
    await Payment.destroy({ where: {}, truncate: true });
    console.log("   ✓ Payments cleared");

    await Expense.destroy({ where: {}, truncate: true });
    console.log("   ✓ Expenses cleared");

    await Document.destroy({ where: {}, truncate: true });
    console.log("   ✓ Documents cleared");

    await Appointment.destroy({ where: {}, truncate: true });
    console.log("   ✓ Appointments cleared");

    await CourtSession.destroy({ where: {}, truncate: true });
    console.log("   ✓ Court Sessions cleared");

    await Invoice.destroy({ where: {}, truncate: true });
    console.log("   ✓ Invoices cleared");

    await Case.destroy({ where: {}, truncate: true });
    console.log("   ✓ Cases cleared");

    await Client.destroy({ where: {}, truncate: true });
    console.log("   ✓ Clients cleared");

    await User.destroy({ where: {}, truncate: true });
    console.log("   ✓ Users cleared");

    await Setting.destroy({ where: {}, truncate: true });
    console.log("   ✓ Settings cleared");

    console.log("✅ Database cleanup complete!\n");
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding with LARGE dataset...\n");

    // Initialize database (creates tables if they don't exist)
    await initDatabase();

    // Clean up existing data
    await cleanupDatabase();

    console.log("👤 Creating users...");
    // Import bcrypt for password hashing
    const bcrypt = await import("bcrypt");

    const users = await User.bulkCreate([
      {
        username: "admin",
        password: await bcrypt.hash("admin123", 10),
        fullName: "زياد المحامي الرئيسي",
        email: "admin@lawoffice-demo.dz",
        role: "admin",
        phone: "0555000001",
        status: "active",
      },
      {
        username: "secretary1",
        password: await bcrypt.hash("secretary123", 10),
        fullName: "هناء السكرتيرة الأولى",
        email: "hana@lawoffice-demo.dz",
        role: "secretary",
        phone: "0555000002",
        status: "active",
      },
      {
        username: "secretary2",
        password: await bcrypt.hash("secretary123", 10),
        fullName: "وردة السكرتيرة الثانية",
        email: "warda@lawoffice-demo.dz",
        role: "secretary",
        phone: "0666000003",
        status: "active",
      },
    ]);
    console.log(`   ✓ Created ${users.length} users\n`);

    // Generate 1000 clients (750 individuals + 250 companies)
    console.log("👥 Creating 1000 clients (this may take a moment)...");
    const clientsData = [];

    // Generate 750 individual clients distributed throughout the year
    for (let i = 0; i < 750; i++) {
      const firstName = randomItem(firstNames);
      const lastName = randomItem(lastNames);
      const wilaya = randomItem(algerianWilayas);
      const createdAt = randomDateThisYear();
      clientsData.push({
        type: "individual",
        firstName: firstName,
        lastName: lastName,
        nationalId: String(1000000000000 + i).padStart(13, '0'),
        phone: `0${randomInt(5, 7)}${String(randomInt(10000000, 99999999))}`,
        email: Math.random() > 0.3 ? `${firstName.replace(/\s/g, '')}.${lastName.replace(/\s/g, '')}.${i}@example-test.dz` : null,
        address: `حي ${randomItem(["النموذج", "التجربة", "الاختبار", "البيانات"])}، عمارة ${randomInt(1, 100)}، ${Math.random() > 0.5 ? `الطابق ${randomInt(1, 5)}` : ''}`,
        city: wilaya,
        wilaya: wilaya,
        notes: Math.random() > 0.7 ? `عميل تجريبي رقم ${i + 1}` : null,
        status: Math.random() > 0.15 ? "active" : "inactive",
        createdAt: createdAt,
        updatedAt: createdAt,
      });
    }

    // Generate 250 company clients distributed throughout the year
    for (let i = 0; i < 250; i++) {
      const wilaya = randomItem(algerianWilayas);
      const companyName = `${randomItem(companyNames)} ${randomItem(["ش.ذ.م.م", "ذ.م.م", "س.ب.ا"])} - ${i + 1}`;
      const createdAt = randomDateThisYear();
      clientsData.push({
        type: "company",
        companyName: companyName,
        nationalId: String(2000000000000 + i).padStart(13, '0'),
        taxId: `0${String(20000000000000 + i).padStart(14, '0')}`,
        phone: `0${randomInt(5, 7)}${String(randomInt(10000000, 99999999))}`,
        email: `contact${i}@company-demo${i}.test`,
        address: `المنطقة الصناعية ${randomItem(["الشرقية", "الغربية", "الشمالية", "الجنوبية"])}، ${Math.random() > 0.5 ? `الطريق الوطني رقم ${randomInt(1, 50)}` : ''}`,
        city: wilaya,
        wilaya: wilaya,
        notes: Math.random() > 0.6 ? `شركة تجريبية رقم ${i + 1}` : null,
        status: Math.random() > 0.1 ? "active" : "inactive",
        createdAt: createdAt,
        updatedAt: createdAt,
      });
    }

    const clients = await Client.bulkCreate(clientsData, {
      updateOnDuplicate: ['createdAt', 'updatedAt']
    });
    console.log(`   ✓ Created ${clients.length} clients\n`);

    // Generate 2000 cases
    console.log("⚖️ Creating 2000 cases (this may take a moment)...");
    const casesData = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 2000; i++) {
      const client = randomItem(clients);
      const caseType = randomItem(caseTypes);
      const status = randomItem(caseStatuses);
      const priority = randomItem(priorities);
      const startDate = randomDateThisYear();
      const isClosed = status === "closed";

      casesData.push({
        caseNumber: `${currentYear - randomInt(0, 2)}/${String(i + 1).padStart(4, '0')}`,
        title: `قضية ${randomItem(["نزاع", "احتيال", "تعويض", "دعوى", "طعن"])} ${randomItem(["تجاري", "عائلي", "عمالي", "مدني", "جنائي"])} رقم ${i + 1}`,
        description: `وصف تفصيلي للقضية رقم ${i + 1}. ${randomItem([
          "نزاع حول عقد تجاري",
          "قضية فصل تعسفي من العمل",
          "نزاع عائلي حول الحضانة",
          "قضية احتيال مالي",
          "دعوى تعويض عن ضرر",
          "نزاع حول ملكية عقار",
          "قضية تزوير وثائق",
          "دعوى إفلاس تجاري"
        ])}`,
        caseType: caseType,
        court: `${randomItem(courtTypes)} - ${randomItem(algerianWilayas)}`,
        courtType: randomItem(courtTypes),
        judge: `القاضي ${randomItem(firstNames)} ${randomItem(lastNames)}`,
        opposingParty: `${randomItem(firstNames)} ${randomItem(lastNames)} - الطرف المقابل`,
        opposingLawyer: Math.random() > 0.3 ? `المحامي ${randomItem(firstNames)} ${randomItem(lastNames)}` : null,
        clientRole: randomItem(clientRoles),
        status: status,
        priority: priority,
        startDate: startDate,
        endDate: isClosed && startDate < new Date() ? randomDate(startDate, new Date()) : null,
        amount: randomInt(50000, 5000000),
        notes: Math.random() > 0.5 ? `ملاحظات القضية رقم ${i + 1}` : null,
        clientId: client.id,
        assignedLawyerId: randomItem(users).id,
      });
    }

    const cases = await Case.bulkCreate(casesData);
    console.log(`   ✓ Created ${cases.length} cases\n`);

    // Generate 3000 court sessions
    console.log("🏛️ Creating 3000 court sessions (this may take a moment)...");
    const courtSessionsData = [];

    for (let i = 0; i < 3000; i++) {
      const caseItem = randomItem(cases);
      const isPast = Math.random() > 0.4; // 60% past, 40% future

      courtSessionsData.push({
        sessionDate: isPast ? pastDate(randomInt(1, 180)) : futureDate(randomInt(1, 90)),
        courtRoom: `القاعة ${randomInt(1, 20)}`,
        judge: `القاضي ${randomItem(firstNames)} ${randomItem(lastNames)}`,
        attendees: Math.random() > 0.3 ? `${randomItem(["جميع الأطراف", "الموكل والمحامي", "الطرفان وممثليهما", "الشهود والأطراف"])}` : null,
        outcome: isPast && Math.random() > 0.4 ? `${randomItem(["تأجيل الجلسة", "صدور الحكم", "جلسة استماع للشهود", "محاولة صلح", "تقديم مستندات إضافية"])}` : null,
        notes: Math.random() > 0.5 ? `ملاحظات الجلسة رقم ${i + 1}` : null,
        status: randomItem(sessionStatuses),
        caseId: caseItem.id,
      });
    }

    const courtSessions = await CourtSession.bulkCreate(courtSessionsData);
    console.log(`   ✓ Created ${courtSessions.length} court sessions\n`);

    // Generate 1500 invoices
    console.log("💰 Creating 1500 invoices (this may take a moment)...");
    const invoicesData = [];

    for (let i = 0; i < 1500; i++) {
      const caseItem = randomItem(cases);
      const invoiceDate = randomDateThisYear();

      invoicesData.push({
        invoiceNumber: `INV-${currentYear - randomInt(0, 2)}-${String(i + 1).padStart(5, '0')}`,
        invoiceDate: invoiceDate,
        description: `أتعاب قانونية للقضية ${caseItem.caseNumber}\n${randomItem([
          "تحضير المذكرات والدراسة الأولية",
          "حضور الجلسات والمرافعة",
          "دراسة الملف والاستشارة القانونية",
          "تمثيل العميل أمام المحكمة",
          "إعداد عريضة الدعوى والمتابعة"
        ])}`,
        taxPercentage: 19.0,
        notes: Math.random() > 0.6 ? `ملاحظات الفاتورة رقم ${i + 1}` : null,
        clientId: caseItem.clientId,
        caseId: caseItem.id,
      });
    }

    const invoices = await Invoice.bulkCreate(invoicesData);
    console.log(`   ✓ Created ${invoices.length} invoices\n`);

    // Generate 4000 payments
    console.log("💵 Creating 4000 payments (this may take a moment)...");
    const paymentsData = [];

    for (let i = 0; i < 4000; i++) {
      const caseItem = randomItem(cases);
      const method = randomItem(paymentMethods);
      const paymentDate = randomDateThisYear();

      paymentsData.push({
        paymentDate: paymentDate,
        amount: randomInt(10000, 500000),
        paymentMethod: method,
        reference: method === "cash" ? null : `${method === "check" ? "CHK" : "TRF"}-${String(randomInt(10000000, 99999999))}`,
        notes: Math.random() > 0.5 ? `${randomItem(["دفعة كاملة", "دفعة جزئية", "دفعة على الحساب", "دفعة مقدمة", "تسوية نهائية"])}` : null,
        caseId: caseItem.id,
      });
    }

    const payments = await Payment.bulkCreate(paymentsData);
    console.log(`   ✓ Created ${payments.length} payments\n`);

    // Generate 2500 appointments
    console.log("📅 Creating 2500 appointments (this may take a moment)...");
    const appointmentsData = [];

    for (let i = 0; i < 2500; i++) {
      const client = randomItem(clients);
      const isPast = Math.random() > 0.35; // 65% past, 35% future
      const status = isPast ? (Math.random() > 0.2 ? "completed" : "cancelled") : "scheduled";
      const clientCases = cases.filter(c => c.clientId === client.id);
      const hasCase = Math.random() > 0.4 && clientCases.length > 0;

      appointmentsData.push({
        title: `${randomItem(["استشارة قانونية", "اجتماع تحضيري", "مراجعة مستندات", "توقيع عقد", "موعد متابعة"])} رقم ${i + 1}`,
        appointmentDate: isPast ? pastDate(randomInt(1, 365)) : futureDate(randomInt(1, 90)),
        duration: randomItem([30, 45, 60, 90, 120]),
        location: randomItem(["المكتب", "المكتب - الطابق الثاني", "قاعة الاجتماعات", "مكتب المحامي الرئيسي"]),
        appointmentType: randomItem(appointmentTypes),
        status: status,
        reminderSent: isPast || Math.random() > 0.7,
        notes: Math.random() > 0.6 ? `ملاحظات الموعد رقم ${i + 1}` : null,
        clientId: client.id,
        caseId: hasCase ? randomItem(clientCases).id : null,
      });
    }

    const appointments = await Appointment.bulkCreate(appointmentsData);
    console.log(`   ✓ Created ${appointments.length} appointments\n`);

    // Generate 3000 expenses
    console.log("💸 Creating 3000 expenses (this may take a moment)...");
    const expensesData = [];

    for (let i = 0; i < 3000; i++) {
      const caseItem = randomItem(cases);
      const category = randomItem(expenseCategories);
      const method = randomItem(paymentMethods);
      const expenseDate = randomDateThisYear();

      expensesData.push({
        description: `${randomItem([
          "رسوم المحكمة",
          "أتعاب خبير",
          "مصاريف تنقل",
          "نسخ وتصوير مستندات",
          "رسوم استخراج وثائق",
          "أتعاب مترجم",
          "مصاريف إدارية",
          "رسوم تسجيل"
        ])} - ${i + 1}`,
        amount: randomInt(1000, 100000),
        expenseDate: expenseDate,
        category: category,
        paymentMethod: method,
        reference: method === "cash" ? null : `EXP-${String(randomInt(100000, 999999))}`,
        notes: Math.random() > 0.6 ? `ملاحظات المصروف رقم ${i + 1}` : null,
        caseId: caseItem.id,
      });
    }

    const expenses = await Expense.bulkCreate(expensesData);
    console.log(`   ✓ Created ${expenses.length} expenses\n`);

    // Generate 5000 documents
    console.log("📄 Creating 5000 documents (this may take a moment)...");
    const documentsData = [];

    for (let i = 0; i < 5000; i++) {
      const client = randomItem(clients);
      const clientCases = cases.filter(c => c.clientId === client.id);
      const hasCase = Math.random() > 0.3 && clientCases.length > 0;
      const caseItem = hasCase ? randomItem(clientCases) : null;
      const docType = randomItem(documentTypes);

      documentsData.push({
        title: `${randomItem([
          "عقد التوكيل",
          "مذكرة دفاع",
          "شهادة ميلاد",
          "تقرير طبي",
          "عقد العمل",
          "شهادة وفاة",
          "سند ملكية",
          "حكم قضائي",
          "وثيقة رسمية",
          "مراسلات"
        ])} - ${i + 1}`,
        documentType: docType,
        description: `وصف الوثيقة رقم ${i + 1}`,
        filePath: `/documents/${hasCase && caseItem ? "cases" : "clients"}/doc_${String(i + 1).padStart(6, '0')}.pdf`,
        fileSize: randomInt(50000, 2000000),
        notes: Math.random() > 0.7 ? `ملاحظات الوثيقة رقم ${i + 1}` : null,
        clientId: client.id,
        caseId: caseItem?.id || null,
      });
    }

    const documents = await Document.bulkCreate(documentsData);
    console.log(`   ✓ Created ${documents.length} documents\n`);

    console.log("⚙️ Creating settings...");
    await Setting.bulkCreate([
      {
        key: "officeName",
        value: "مكتب المحاماة النموذجي التجريبي",
        category: "general",
        description: "اسم المكتب",
      },
      {
        key: "officeAddress",
        value: "الجزائر العاصمة، حي التجارب، عمارة رقم 999، الطابق الثالث",
        category: "general",
        description: "عنوان المكتب",
      },
      {
        key: "officePhone",
        value: "021 00 00 00",
        category: "general",
        description: "هاتف المكتب",
      },
      {
        key: "officeEmail",
        value: "contact@demo-lawoffice.test",
        category: "general",
        description: "البريد الإلكتروني للمكتب",
      },
      {
        key: "officeLogo",
        value: "",
        category: "general",
        description: "شعار المكتب (Base64)",
      },
      {
        key: "taxId",
        value: "999999999999999",
        category: "general",
        description: "الرقم الجبائي",
      },
      {
        key: "registrationNumber",
        value: "REG-DEMO-2024-001",
        category: "general",
        description: "رقم التسجيل",
      },
      {
        key: "bankName",
        value: "البنك التجريبي النموذجي",
        category: "financial",
        description: "اسم البنك",
      },
      {
        key: "bankAccountNumber",
        value: "0000000000",
        category: "financial",
        description: "رقم الحساب البنكي",
      },
      {
        key: "bankIBAN",
        value: "DZ00 0000 0000 0000 0000 00",
        category: "financial",
        description: "رقم IBAN",
      },
      {
        key: "taxRate",
        value: "19",
        category: "financial",
        description: "نسبة الضريبة على القيمة المضافة (%)",
      },
      {
        key: "currency",
        value: "DZD",
        category: "financial",
        description: "العملة",
      },
      {
        key: "invoicePrefix",
        value: "INV",
        category: "financial",
        description: "بادئة رقم الفاتورة",
      },
      {
        key: "defaultPaymentTerms",
        value: "30",
        category: "financial",
        description: "شروط الدفع الافتراضية (بالأيام)",
      },
      {
        key: "reminderDaysBefore",
        value: "3",
        category: "notifications",
        description: "عدد الأيام قبل الموعد لإرسال تذكير",
      },
      {
        key: "businessHoursStart",
        value: "08:00",
        category: "general",
        description: "بداية ساعات العمل",
      },
      {
        key: "businessHoursEnd",
        value: "17:00",
        category: "general",
        description: "نهاية ساعات العمل",
      },
    ]);
    console.log(`   ✓ Created ${await Setting.count()} settings\n`);

    console.log("✅ Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   👤 Users: ${users.length}`);
    console.log(`   👥 Clients: ${clients.length}`);
    console.log(`   ⚖️ Cases: ${cases.length}`);
    console.log(`   🏛️ Court Sessions: ${courtSessions.length}`);
    console.log(`   💰 Invoices: ${invoices.length}`);
    console.log(`   📅 Appointments: ${await Appointment.count()}`);
    console.log(`   📄 Documents: ${await Document.count()}`);
    console.log(`   💸 Expenses: ${await Expense.count()}`);
    console.log(`   💵 Payments: ${await Payment.count()}`);
    console.log(`   ⚙️ Settings: ${await Setting.count()}`);
    console.log("\n🔐 Default Login Credentials:");
    console.log("   Admin: admin / admin123");
    console.log("   Secretary 1: secretary1 / secretary123");
    console.log("   Secretary 2: secretary2 / secretary123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the seed function
seedDatabase();
