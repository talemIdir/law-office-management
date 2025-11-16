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
    console.log("🌱 Starting database seeding...\n");

    // Initialize database (creates tables if they don't exist)
    await initDatabase();

    // Clean up existing data
    await cleanupDatabase();

    console.log("👤 Creating users...");
    const users = await User.bulkCreate([
      {
        username: "admin",
        password: "admin123", // In production, this should be hashed
        fullName: "أحمد بن محمد",
        email: "admin@lawoffice.dz",
        role: "admin",
        phone: "0555123456",
        status: "active",
      },
      {
        username: "lawyer1",
        password: "lawyer123",
        fullName: "فاطمة بن علي",
        email: "fatima@lawoffice.dz",
        role: "lawyer",
        phone: "0666234567",
        status: "active",
      },
      {
        username: "lawyer2",
        password: "lawyer123",
        fullName: "محمد بن يوسف",
        email: "mohamed@lawoffice.dz",
        role: "lawyer",
        phone: "0777345678",
        status: "active",
      },
      {
        username: "assistant1",
        password: "assistant123",
        fullName: "سارة بن عمر",
        email: "sara@lawoffice.dz",
        role: "assistant",
        phone: "0555456789",
        status: "active",
      },
    ]);

    console.log("👥 Creating clients...");
    const clients = await Client.bulkCreate([
      // Individual clients
      {
        type: "individual",
        firstName: "عبد الرحمن",
        lastName: "بن صالح",
        nationalId: "1234567890123",
        phone: "0555111222",
        email: "abderrahmane@email.dz",
        address: "حي النصر، عمارة رقم 12، الطابق الرابع، شقة 15",
        city: "Alger Centre",
        wilaya: "Alger",
        notes: "عميل مهم، يفضل التواصل صباحاً، لديه قضايا متعددة",
        status: "active",
      },
      {
        type: "individual",
        firstName: "أمينة",
        lastName: "بن عيسى",
        nationalId: "2345678901234",
        phone: "0666222333",
        email: "amina@email.dz",
        address: "شارع الاستقلال، رقم 45، بالقرب من مسجد الباشا",
        city: "Oran",
        wilaya: "Oran",
        notes: "عميلة متعاونة، تفضل التواصل عبر البريد الإلكتروني",
        status: "active",
      },
      {
        type: "individual",
        firstName: "كريم",
        lastName: "بن مصطفى",
        nationalId: "3456789012345",
        phone: "0777333444",
        email: "karim@email.dz",
        address: "حي بوشوشة، عمارة 7، الطابق الأول",
        city: "Constantine",
        wilaya: "Constantine",
        notes: "رجل أعمال، لديه عدة قضايا تجارية",
        status: "active",
      },
      {
        type: "individual",
        firstName: "نادية",
        lastName: "بن خليفة",
        nationalId: "4567890123456",
        phone: "0555444555",
        email: "nadia@email.dz",
        address: "شارع العربي بن مهيدي، عمارة الأمل، شقة 8",
        city: "Annaba",
        wilaya: "Annaba",
        notes: "موظفة في القطاع العام",
        status: "active",
      },
      {
        type: "individual",
        firstName: "ياسين",
        lastName: "بن عمر",
        nationalId: "5678901234567",
        phone: "0666555666",
        email: "yassine@email.dz",
        address: "حي السلام، رقم 23، بجانب المدرسة الابتدائية",
        city: "Blida",
        wilaya: "Blida",
        notes: "لديه نزاع عائلي معقد",
        status: "active",
      },
      // Company clients
      {
        type: "company",
        companyName: "شركة الأمل للتجارة والخدمات ش.ذ.م.م",
        nationalId: "9876543210123",
        taxId: "098765432109876",
        phone: "0555777888",
        email: "contact@alamal.dz",
        address: "المنطقة الصناعية، الطريق الوطني رقم 1، المبنى A",
        city: "Rouiba",
        wilaya: "Alger",
        notes: "شركة تجارية كبرى متخصصة في الاستيراد والتصدير، عميل منذ 2020",
        status: "active",
      },
      {
        type: "company",
        companyName: "مؤسسة النجاح للبناء والأشغال العمومية",
        nationalId: "8765432109876",
        taxId: "087654321098765",
        phone: "0666888999",
        email: "info@ennajah.dz",
        address: "حي الصناعي، عمارة رقم 15، الطابق الثاني",
        city: "Es-Sénia",
        wilaya: "Oran",
        notes: "مؤسسة إنشاءات، لديها عدة نزاعات مع المقاولين",
        status: "active",
      },
      {
        type: "company",
        companyName: "شركة التطور للخدمات الرقمية",
        nationalId: "7654321098765",
        taxId: "076543210987654",
        phone: "0777999000",
        email: "contact@tatawor.dz",
        address: "المركز التجاري، الطابق الثالث، مكتب رقم 305",
        city: "Constantine",
        wilaya: "Constantine",
        notes: "شركة ناشئة في مجال التكنولوجيا",
        status: "active",
      },
      {
        type: "individual",
        firstName: "سعيد",
        lastName: "بن حسن",
        nationalId: "6789012345678",
        phone: "0555888999",
        address: "حي الزيتون، رقم 34",
        city: "Sétif",
        wilaya: "Sétif",
        notes: "عميل سابق، تم إغلاق قضيته",
        status: "inactive",
      },
      {
        type: "individual",
        firstName: "ليلى",
        lastName: "بن رشيد",
        nationalId: "7890123456789",
        phone: "0666999111",
        email: "layla@email.dz",
        address: "شارع ديدوش مراد، رقم 89، عمارة النور",
        city: "Béjaïa",
        wilaya: "Béjaïa",
        notes: "أستاذة جامعية، تفضل المواعيد بعد الظهر",
        status: "active",
      },
      {
        type: "individual",
        firstName: "رشيد",
        lastName: "بن عبد الله",
        nationalId: "8901234567890",
        phone: "0555222333",
        email: "rachid@email.dz",
        address: "حي القدس، عمارة 45، الطابق الثالث",
        city: "Tlemcen",
        wilaya: "Tlemcen",
        notes: "تاجر في السوق المحلي",
        status: "active",
      },
      {
        type: "company",
        companyName: "شركة الرائد للنقل والخدمات اللوجستية",
        nationalId: "6543210987654",
        taxId: "065432109876543",
        phone: "0666111222",
        email: "info@raed-logistics.dz",
        address: "الطريق الوطني رقم 5، المنطقة الصناعية الغربية",
        city: "Sidi Bel Abbès",
        wilaya: "Sidi Bel Abbès",
        notes: "شركة نقل وطنية، لديها أسطول كبير من الشاحنات",
        status: "active",
      },
    ]);
    console.log(`   ✓ Created ${clients.length} clients\n`);

    console.log("⚖️ Creating cases...");
    const cases = await Case.bulkCreate([
      // Cases for client 0 (عبد الرحمن بن صالح) - Multiple cases
      {
        caseNumber: "2023/156",
        title: "قضية احتيال مالي",
        description: "احتيال في صفقة عقارية - تم الاستيلاء على مبلغ 5 مليون دينار مقابل عقار وهمي",
        caseType: "criminal",
        court: "محكمة الجنايات - الجزائر",
        courtType: "محكمة الجنايات",
        judge: "القاضي رشيد بن محمد",
        opposingParty: "المتهم عبد الله بن سعيد",
        opposingLawyer: "الأستاذة نجاة بن علي",
        clientRole: "plaintiff",
        status: "appealed",
        priority: "urgent",
        startDate: pastDate(180),
        endDate: pastDate(30),
        amount: 5000000.0,
        notes: "تم الاستئناف ضد الحكم الابتدائي الذي قضى بالسجن لمدة 3 سنوات فقط",
        clientId: clients[0].id,
        assignedLawyerId: users[1].id,
      },
      {
        caseNumber: "2024/015",
        title: "قضية تعويض عن ضرر معنوي",
        description: "طلب تعويض عن أضرار معنوية نتيجة نشر أخبار كاذبة",
        caseType: "civil",
        court: "المحكمة المدنية - الجزائر",
        courtType: "محكمة ابتدائية",
        judge: "القاضية سميرة بن عمر",
        opposingParty: "جريدة الأخبار اليومية",
        opposingLawyer: "الأستاذ كمال بن علي",
        clientRole: "plaintiff",
        status: "in_progress",
        priority: "medium",
        startDate: pastDate(60),
        nextHearingDate: futureDate(25),
        amount: 800000.0,
        notes: "تم جمع الأدلة والشهود، القضية في مرحلة المرافعات",
        clientId: clients[0].id,
        assignedLawyerId: users[2].id,
      },
      // Cases for client 5 (شركة الأمل للتجارة) - Multiple cases
      {
        caseNumber: "2024/001",
        title: "قضية نزاع تجاري - عقد توريد",
        description: "نزاع حول عقد توريد بضائع مستوردة بقيمة 850 ألف دينار - عدم الالتزام بالمواصفات المتفق عليها",
        caseType: "commercial",
        court: "المحكمة التجارية - الجزائر",
        courtType: "محكمة ابتدائية",
        judge: "القاضي عبد الكريم بن علي",
        opposingParty: "شركة الوفاء للتوريد",
        opposingLawyer: "الأستاذ محمد بن حسين",
        clientRole: "plaintiff",
        status: "in_progress",
        priority: "high",
        startDate: pastDate(45),
        nextHearingDate: futureDate(15),
        amount: 850000.0,
        notes: "القضية في مرحلة متقدمة، الجلسة القادمة حاسمة - تم تقديم تقرير خبير",
        clientId: clients[5].id,
        assignedLawyerId: users[1].id,
      },
      {
        caseNumber: "2024/028",
        title: "قضية نزاع على علامة تجارية",
        description: "نزاع حول استخدام علامة تجارية مسجلة - انتهاك حقوق الملكية الفكرية",
        caseType: "commercial",
        court: "المحكمة التجارية - الجزائر",
        courtType: "محكمة ابتدائية",
        judge: "القاضي محمد بن زكرياء",
        opposingParty: "شركة المستقبل للتكنولوجيا",
        opposingLawyer: "الأستاذة ليلى بن سعيد",
        clientRole: "plaintiff",
        status: "open",
        priority: "medium",
        startDate: pastDate(20),
        nextHearingDate: futureDate(35),
        amount: 1200000.0,
        notes: "تم تقديم شهادة تسجيل العلامة التجارية من المعهد الوطني",
        clientId: clients[5].id,
        assignedLawyerId: users[1].id,
      },
      // Cases for client 1 (أمينة بن عيسى)
      {
        caseNumber: "2024/002",
        title: "قضية طلاق وحضانة",
        description: "طلاق بالتراضي مع تسوية حضانة الأطفال والنفقة",
        caseType: "family",
        court: "محكمة الأسرة - وهران",
        courtType: "محكمة ابتدائية",
        judge: "القاضية فاطمة بن يوسف",
        opposingParty: "محمد بن عمر",
        clientRole: "plaintiff",
        status: "in_progress",
        priority: "medium",
        startDate: pastDate(30),
        nextHearingDate: futureDate(20),
        amount: 180000.0,
        notes: "الطرفان متفاهمان، يتبقى تسوية النفقة الشهرية",
        clientId: clients[1].id,
        assignedLawyerId: users[2].id,
      },
      {
        caseNumber: "2024/003",
        title: "قضية حادث مرور",
        description: "تعويض عن أضرار ناتجة عن حادث مرور",
        caseType: "civil",
        court: "المحكمة المدنية - قسنطينة",
        courtType: "محكمة ابتدائية",
        judge: "القاضي أحمد بن مبارك",
        opposingParty: "شركة التأمين الوطنية",
        opposingLawyer: "الأستاذة سارة بن علي",
        clientRole: "plaintiff",
        status: "open",
        priority: "medium",
        startDate: pastDate(15),
        nextHearingDate: futureDate(30),
        amount: 250000.0,
        notes: "تم تقديم جميع المستندات الطبية",
        clientId: clients[2].id,
        assignedLawyerId: users[1].id,
      },
      {
        caseNumber: "2024/004",
        title: "قضية نزاع عمالي",
        description: "فصل تعسفي من العمل",
        caseType: "labor",
        court: "محكمة العمل - عنابة",
        courtType: "محكمة ابتدائية",
        judge: "القاضي يوسف بن عمر",
        opposingParty: "شركة الإنتاج الصناعي",
        opposingLawyer: "الأستاذ كمال بن صالح",
        clientRole: "plaintiff",
        status: "in_progress",
        priority: "high",
        startDate: pastDate(60),
        nextHearingDate: futureDate(10),
        amount: 450000.0,
        notes: "شهود الإثبات جاهزون للإدلاء بشهاداتهم",
        clientId: clients[3].id,
        assignedLawyerId: users[2].id,
      },
      {
        caseNumber: "2024/005",
        title: "قضية ميراث",
        description: "تقسيم تركة والد متوفى",
        caseType: "family",
        court: "المحكمة الشرعية - البليدة",
        courtType: "محكمة ابتدائية",
        judge: "القاضي إبراهيم بن حسن",
        opposingParty: "الورثة الآخرون",
        clientRole: "plaintiff",
        status: "in_progress",
        priority: "medium",
        startDate: pastDate(90),
        amount: 3500000.0,
        notes: "تم حصر الممتلكات، في انتظار تقييم العقارات",
        clientId: clients[4].id,
        assignedLawyerId: users[1].id,
      },
      // Cases for client 2 (كريم بن مصطفى)
      {
        caseNumber: "2024/007",
        title: "قضية نزاع تجاري - عقد شراكة",
        description: "نزاع حول شراكة تجارية - عدم الالتزام بالحصص المتفق عليها",
        caseType: "commercial",
        court: "المحكمة التجارية - قسنطينة",
        courtType: "محكمة ابتدائية",
        judge: "القاضي أحمد بن مبارك",
        opposingParty: "الشريك السابق - حسن بن رمضان",
        opposingLawyer: "الأستاذة سارة بن علي",
        clientRole: "plaintiff",
        status: "open",
        priority: "medium",
        startDate: pastDate(15),
        nextHearingDate: futureDate(30),
        amount: 650000.0,
        notes: "تم تقديم جميع عقود الشراكة والوثائق المالية",
        clientId: clients[2].id,
        assignedLawyerId: users[1].id,
      },
      // Cases for client 3 (نادية بن خليفة)
      {
        caseNumber: "2024/008",
        title: "قضية نزاع عمالي - فصل تعسفي",
        description: "فصل تعسفي من العمل دون سبب مشروع",
        caseType: "labor",
        court: "محكمة العمل - عنابة",
        courtType: "محكمة ابتدائية",
        judge: "القاضي يوسف بن عمر",
        opposingParty: "شركة الإنتاج الصناعي",
        opposingLawyer: "الأستاذ كمال بن صالح",
        clientRole: "plaintiff",
        status: "in_progress",
        priority: "high",
        startDate: pastDate(60),
        nextHearingDate: futureDate(10),
        amount: 450000.0,
        notes: "شهود الإثبات جاهزون للإدلاء بشهاداتهم",
        clientId: clients[3].id,
        assignedLawyerId: users[2].id,
      },
      // Cases for client 6 (مؤسسة النجاح للبناء)
      {
        caseNumber: "2024/006",
        title: "قضية نزاع حول عقار",
        description: "نزاع ملكية أرض فلاحية",
        caseType: "civil",
        court: "المحكمة العقارية - وهران",
        courtType: "محكمة ابتدائية",
        judge: "القاضية زينب بن يوسف",
        opposingParty: "عائلة بن سليمان",
        clientRole: "defendant",
        status: "in_progress",
        priority: "high",
        startDate: pastDate(120),
        nextHearingDate: futureDate(25),
        amount: 2000000.0,
        notes: "المستندات العقارية قديمة، يتطلب البحث في السجلات",
        clientId: clients[6].id,
        assignedLawyerId: users[2].id,
      },
      // Cases for client 8 (سعيد بن حسن) - Inactive client
      {
        caseNumber: "2023/234",
        title: "قضية تعويض عن ضرر",
        description: "تعويض عن أضرار معنوية",
        caseType: "civil",
        court: "المحكمة المدنية - سطيف",
        courtType: "محكمة ابتدائية",
        judge: "القاضي سمير بن علي",
        opposingParty: "مؤسسة إعلامية",
        clientRole: "plaintiff",
        status: "won",
        priority: "low",
        startDate: pastDate(200),
        endDate: pastDate(20),
        amount: 150000.0,
        notes: "تم كسب القضية والحصول على التعويض الكامل - عميل غير نشط حالياً",
        clientId: clients[8].id,
        assignedLawyerId: users[1].id,
      },
      // Cases for client 9 (ليلى بن رشيد)
      {
        caseNumber: "2024/010",
        title: "قضية نزاع عائلي - نفقة",
        description: "طلب زيادة نفقة الأطفال",
        caseType: "family",
        court: "محكمة الأسرة - بجاية",
        courtType: "محكمة ابتدائية",
        judge: "القاضية فريدة بن يوسف",
        opposingParty: "الزوج السابق",
        clientRole: "plaintiff",
        status: "in_progress",
        priority: "medium",
        startDate: pastDate(40),
        nextHearingDate: futureDate(18),
        amount: 120000.0,
        notes: "تم تقديم مستندات تثبت زيادة تكاليف المعيشة",
        clientId: clients[9].id,
        assignedLawyerId: users[2].id,
      },
    ]);
    console.log(`   ✓ Created ${cases.length} cases\n`);

    console.log("🏛️ Creating court sessions...");
    const courtSessions = await CourtSession.bulkCreate([
      {
        sessionDate: futureDate(15),
        court: "المحكمة التجارية - الجزائر",
        courtRoom: "القاعة 3",
        judge: "القاضي عبد الكريم بن علي",
        attendees: "المحامي، الموكل، الطرف المقابل",
        notes: "يجب إحضار جميع المستندات المالية",
        status: "في التقرير",
        caseId: cases[0].id,
      },
      {
        sessionDate: futureDate(20),
        court: "محكمة الأسرة - وهران",
        courtRoom: "القاعة 1",
        judge: "القاضية فاطمة بن يوسف",
        attendees: "الطرفان مع محامييهما",
        notes: "جلسة تسوية ودية",
        status: "في المرافعة",
        caseId: cases[1].id,
      },
      {
        sessionDate: futureDate(30),
        court: "المحكمة المدنية - قسنطينة",
        courtRoom: "القاعة 5",
        judge: "القاضي أحمد بن مبارك",
        notes: "جلسة الاستماع للشهود",
        status: "لجواب الخصم",
        caseId: cases[2].id,
      },
      {
        sessionDate: futureDate(10),
        court: "محكمة العمل - عنابة",
        courtRoom: "القاعة 2",
        judge: "القاضي يوسف بن عمر",
        attendees: "الموكل، ممثل الشركة، الشهود",
        notes: "جلسة حاسمة - الاستماع لشهادة الشهود",
        status: "جلسة المحاكمة",
        caseId: cases[3].id,
      },
      {
        sessionDate: pastDate(10),
        court: "المحكمة التجارية - الجزائر",
        courtRoom: "القاعة 3",
        judge: "القاضي عبد الكريم بن علي",
        attendees: "جميع الأطراف حاضرون",
        outcome: "تأجيل الجلسة لتقديم مستندات إضافية",
        nextSessionDate: futureDate(15),
        notes: "طلب القاضي كشوف حسابات إضافية",
        status: "مؤجلة",
        caseId: cases[0].id,
      },
      {
        sessionDate: pastDate(25),
        court: "محكمة الأسرة - وهران",
        courtRoom: "القاعة 1",
        judge: "القاضية فاطمة بن يوسف",
        attendees: "الطرفان حاضران",
        outcome: "اتفاق مبدئي على الحضانة",
        nextSessionDate: futureDate(20),
        status: "في المداولة",
        caseId: cases[1].id,
      },
      {
        sessionDate: futureDate(25),
        court: "المحكمة العقارية - وهران",
        courtRoom: "القاعة 4",
        judge: "القاضية زينب بن يوسف",
        notes: "جلسة الفصل في النزاع",
        status: "لجوابنا",
        caseId: cases[6].id,
      },
      {
        sessionDate: futureDate(5),
        court: "المحكمة الجنائية - الجزائر",
        courtRoom: "القاعة 7",
        judge: "القاضي رشيد بن محمد",
        attendees: "المتهم، المحامي، الشهود",
        notes: "جلسة استماع للشهود في قضية الاحتيال المالي",
        status: "في التقرير",
        caseId: cases[0].id,
      },
      {
        sessionDate: futureDate(12),
        court: "المحكمة المدنية - وهران",
        courtRoom: "القاعة 2",
        judge: "القاضي عمر بن الطاهر",
        attendees: "الطرفان وممثليهما",
        notes: "جلسة تقديم الأدلة في قضية النزاع العقاري",
        status: "في المرافعة",
        caseId: cases[6].id,
      },
      {
        sessionDate: futureDate(18),
        court: "محكمة الأسرة - قسنطينة",
        courtRoom: "القاعة 3",
        judge: "القاضية سامية بن عيسى",
        notes: "جلسة محاولة الصلح النهائية",
        status: "لجواب الخصم",
        caseId: cases[1].id,
      },
    ]);
    console.log(`   ✓ Created ${courtSessions.length} court sessions\n`);

    console.log("💰 Creating invoices...");
    const invoices = await Invoice.bulkCreate([
      {
        invoiceNumber: "INV-2024-001",
        invoiceDate: pastDate(30),
        description: "أتعاب قضية نزاع تجاري - عقد توريد - المرحلة الأولى\nتتضمن: الدراسة الأولية للملف، تحضير المذكرات، حضور الجلسات",
        taxPercentage: 19.0,
        notes: "تم الاتفاق على نسبة 15% من قيمة القضية كأتعاب",
        clientId: clients[5].id,
        caseId: cases[2].id, // Case 2024/001 - index 2
      },
      {
        invoiceNumber: "INV-2024-002",
        invoiceDate: pastDate(25),
        description: "أتعاب قضية طلاق وحضانة\nتشمل: التشاور المبدئي، تحضير عريضة الطلاق، المرافعة",
        taxPercentage: 19.0,
        notes: "تم الاتفاق على مبلغ ثابت",
        clientId: clients[1].id,
        caseId: cases[4].id, // Case 2024/002 - index 4
      },
      {
        invoiceNumber: "INV-2024-003",
        invoiceDate: pastDate(10),
        description: "أتعاب قضية نزاع تجاري - عقد شراكة\nتتضمن: دراسة عقود الشراكة، تحضير المذكرات، المرافعة",
        taxPercentage: 19.0,
        notes: "قضية نزاع شراكة تجارية",
        clientId: clients[2].id,
        caseId: cases[8].id, // Case 2024/007 - index 8
      },
      {
        invoiceNumber: "INV-2024-004",
        invoiceDate: pastDate(55),
        description: "أتعاب قضية نزاع عمالي - فصل تعسفي\nتشمل: دراسة عقد العمل، تحضير الدعوى، حضور الجلسات",
        taxPercentage: 19.0,
        notes: "دفعات على مراحل حسب تطور القضية",
        clientId: clients[3].id,
        caseId: cases[9].id, // Case 2024/008 - index 9
      },
      {
        invoiceNumber: "INV-2024-005",
        invoiceDate: pastDate(85),
        description: "أتعاب قضية ميراث - تقسيم تركة\nتتضمن: دراسة وثائق الملكية، حصر التركة، تقسيم الورثة حسب الشريعة، المتابعة القضائية",
        taxPercentage: 19.0,
        notes: "تم الدفع كاملاً - قضية مغلقة",
        clientId: clients[4].id,
        caseId: cases[7].id, // Case 2024/005 - index 7
      },
      {
        invoiceNumber: "INV-2024-006",
        invoiceDate: pastDate(175),
        description: "أتعاب قضية احتيال مالي - صفقة عقارية وهمية\nتشمل: جمع الأدلة، تحضير الشكوى الجنائية، المتابعة في مراحل التحقيق والمحاكمة",
        taxPercentage: 19.0,
        notes: "تم رفع الاستئناف - قضية معقدة تتطلب متابعة طويلة الأمد",
        clientId: clients[0].id,
        caseId: cases[0].id, // Case 2023/156 - index 0
      },
      {
        invoiceNumber: "INV-2024-007",
        invoiceDate: pastDate(15),
        description: "أتعاب قضية نزاع عقاري - ملكية أرض فلاحية\nتتضمن: البحث في السجلات العقارية، تحضير المستندات، المرافعة",
        taxPercentage: 19.0,
        notes: "قضية معقدة تتطلب بحث تاريخي في السجلات",
        clientId: clients[6].id,
        caseId: cases[10].id, // Case 2024/006 - index 10
      },
      {
        invoiceNumber: "INV-2024-008",
        invoiceDate: pastDate(55),
        description: "أتعاب قضية تعويض عن ضرر معنوي\nتشمل: تحضير الدعوى، جمع الأدلة والشهود، المرافعة أمام المحكمة",
        taxPercentage: 19.0,
        notes: "قضية منتهية بالفوز - تم الحصول على التعويض",
        clientId: clients[0].id,
        caseId: cases[1].id, // Case 2024/015 - index 1
      },
      {
        invoiceNumber: "INV-2024-009",
        invoiceDate: pastDate(18),
        description: "أتعاب قضية نزاع على علامة تجارية\nتتضمن: دراسة حقوق الملكية الفكرية، تحضير الدعوى، التفاوض للتسوية الودية",
        taxPercentage: 19.0,
        notes: "قضية جديدة - تم تقديم الدعوى",
        clientId: clients[5].id,
        caseId: cases[3].id, // Case 2024/028 - index 3
      },
    ]);
    console.log(`   ✓ Created ${invoices.length} invoices\n`);

    console.log("💵 Creating payments...");
    await Payment.bulkCreate([
      {
        paymentDate: pastDate(28),
        amount: 238000.0,
        paymentMethod: "bank_transfer",
        reference: "TRF-20240315-001",
        notes: "دفع كامل - حساب البنك الوطني الجزائري",
        caseId: cases[0].id,
      },
      {
        paymentDate: pastDate(15),
        amount: 90000.0,
        paymentMethod: "check",
        reference: "CHK-20240330-002",
        notes: "دفعة جزئية - شيك رقم 4567890 - بنك الخليج",
        caseId: cases[1].id,
      },
      {
        paymentDate: pastDate(48),
        amount: 297500.0,
        paymentMethod: "cash",
        notes: "دفع كامل - دفع نقدي، تم إصدار وصل",
        caseId: cases[4].id,
      },
      {
        paymentDate: pastDate(12),
        amount: 150000.0,
        paymentMethod: "bank_transfer",
        reference: "TRF-20240402-003",
        notes: "دفعة أولى - حوالة بنكية",
        caseId: cases[6].id,
      },
      {
        paymentDate: pastDate(5),
        amount: 100000.0,
        paymentMethod: "cash",
        notes: "دفعة مقدمة على حساب القضية - تم إصدار وصل",
        caseId: cases[2].id,
      },
      {
        paymentDate: pastDate(3),
        amount: 50000.0,
        paymentMethod: "bank_transfer",
        reference: "TRF-20240410-004",
        notes: "دفعة جزئية على حساب القضية",
        caseId: cases[3].id,
      },
      {
        paymentDate: pastDate(60),
        amount: 200000.0,
        paymentMethod: "bank_transfer",
        reference: "TRF-20240215-005",
        notes: "دفعة أولى عند بداية القضية - حوالة بنكية",
        caseId: cases[0].id,
      },
      {
        paymentDate: pastDate(25),
        amount: 75000.0,
        paymentMethod: "cash",
        notes: "دفعة نقدية إضافية على القضية",
        caseId: cases[1].id,
      },
      {
        paymentDate: pastDate(18),
        amount: 120000.0,
        paymentMethod: "check",
        reference: "CHK-20240327-006",
        notes: "دفعة مقدمة - شيك رقم 7891234",
        caseId: cases[6].id,
      },
    ]);
    console.log(`   ✓ Created ${await Payment.count()} payments\n`);

    console.log("📅 Creating appointments...");
    await Appointment.bulkCreate([
      {
        title: "استشارة قانونية - قضية جديدة",
        appointmentDate: futureDate(3),
        duration: 60,
        location: "المكتب - الطابق الثاني",
        appointmentType: "consultation",
        status: "scheduled",
        reminderSent: false,
        notes: "موعد أولي لمناقشة قضية عقارية",
        clientId: clients[8].id,
      },
      {
        title: "اجتماع لمناقشة القضية",
        appointmentDate: futureDate(7),
        duration: 90,
        location: "المكتب - قاعة الاجتماعات",
        appointmentType: "meeting",
        status: "scheduled",
        reminderSent: false,
        notes: "اجتماع مع فريق العمل والموكل",
        clientId: clients[5].id,
        caseId: cases[0].id,
      },
      {
        title: "موعد توقيع اتفاقية",
        appointmentDate: futureDate(12),
        duration: 45,
        location: "المكتب - مكتب المحامي الرئيسي",
        appointmentType: "meeting",
        status: "scheduled",
        reminderSent: false,
        notes: "توقيع اتفاقية التسوية الودية",
        clientId: clients[1].id,
        caseId: cases[1].id,
      },
      {
        title: "استشارة عاجلة",
        appointmentDate: futureDate(1),
        duration: 30,
        location: "المكتب",
        appointmentType: "consultation",
        status: "scheduled",
        reminderSent: false,
        notes: "استشارة عاجلة حول قضية عمالية",
        clientId: clients[3].id,
      },
      {
        title: "مراجعة المستندات",
        appointmentDate: pastDate(5),
        duration: 60,
        location: "المكتب",
        appointmentType: "meeting",
        status: "completed",
        reminderSent: true,
        notes: "تمت مراجعة جميع المستندات بنجاح",
        clientId: clients[2].id,
        caseId: cases[2].id,
      },
      {
        title: "استشارة - قضية ميراث",
        appointmentDate: pastDate(15),
        duration: 90,
        location: "المكتب",
        appointmentType: "consultation",
        status: "completed",
        reminderSent: true,
        notes: "تم شرح إجراءات تقسيم الميراث",
        clientId: clients[4].id,
      },
      {
        title: "اجتماع تحضيري للجلسة",
        appointmentDate: futureDate(8),
        duration: 120,
        location: "المكتب - قاعة الاجتماعات",
        appointmentType: "meeting",
        status: "scheduled",
        reminderSent: false,
        notes: "التحضير للجلسة القادمة مع الشهود",
        clientId: clients[3].id,
        caseId: cases[3].id,
      },
      {
        title: "موعد ملغى",
        appointmentDate: futureDate(20),
        duration: 60,
        location: "المكتب",
        appointmentType: "consultation",
        status: "cancelled",
        reminderSent: false,
        notes: "تم الإلغاء بطلب من العميل",
        clientId: clients[9].id,
      },
    ]);
    console.log(`   ✓ Created ${await Appointment.count()} appointments\n`);

    console.log("💸 Creating expenses...");
    await Expense.bulkCreate([
      {
        description: "رسوم المحكمة - قضية تجارية",
        amount: 15000.0,
        expenseDate: pastDate(35),
        category: "court_fees",
        paymentMethod: "bank_transfer",
        reference: "COURT-2024-001",
        notes: "رسوم تسجيل القضية",
        caseId: cases[0].id,
      },
      {
        description: "أتعاب خبير - تقييم عقاري",
        amount: 50000.0,
        expenseDate: pastDate(25),
        category: "other",
        paymentMethod: "check",
        notes: "تقييم العقار موضوع النزاع",
        caseId: cases[6].id,
      },
      {
        description: "مصاريف تنقل - زيارة موقع الحادث",
        amount: 8000.0,
        expenseDate: pastDate(20),
        category: "transportation",
        paymentMethod: "cash",
        notes: "زيارة موقع حادث المرور",
        caseId: cases[2].id,
      },
      {
        description: "نسخ وتصوير مستندات",
        amount: 3500.0,
        expenseDate: pastDate(15),
        category: "documentation",
        paymentMethod: "cash",
        notes: "نسخ ملف القضية كاملاً",
        caseId: cases[3].id,
      },
      {
        description: "رسوم استخراج وثائق رسمية",
        amount: 5000.0,
        expenseDate: pastDate(10),
        category: "documentation",
        paymentMethod: "cash",
        notes: "استخراج شهادات من السجل العقاري",
        caseId: cases[4].id,
      },
      {
        description: "أتعاب مترجم قانوني",
        amount: 12000.0,
        expenseDate: pastDate(8),
        category: "other",
        paymentMethod: "bank_transfer",
        notes: "ترجمة مستندات أجنبية",
        caseId: cases[0].id,
      },
    ]);
    console.log(`   ✓ Created ${await Expense.count()} expenses\n`);

    console.log("📄 Creating documents...");
    await Document.bulkCreate([
      {
        title: "عقد التوكيل",
        documentType: "contract",
        description: "عقد توكيل رسمي للموكل",
        filePath: "/documents/clients/contract_001.pdf",
        fileSize: 245678,
        notes: "عقد موثق",
        clientId: clients[0].id,
      },
      {
        title: "مذكرة دفاع",
        documentType: "court_filing",
        description: "مذكرة دفاع في القضية التجارية",
        filePath: "/documents/cases/brief_001.pdf",
        fileSize: 456789,
        notes: "تم تقديمها للمحكمة",
        caseId: cases[0].id,
        clientId: clients[5].id,
      },
      {
        title: "شهادة ميلاد",
        documentType: "id_document",
        description: "نسخة من شهادة الميلاد",
        filePath: "/documents/clients/birth_cert_001.pdf",
        fileSize: 123456,
        clientId: clients[1].id,
      },
      {
        title: "تقرير طبي",
        documentType: "evidence",
        description: "تقرير طبي حول إصابات الحادث",
        filePath: "/documents/cases/medical_report_001.pdf",
        fileSize: 678901,
        notes: "دليل هام في القضية",
        caseId: cases[2].id,
        clientId: clients[2].id,
      },
      {
        title: "عقد العمل",
        documentType: "contract",
        description: "نسخة من عقد العمل",
        filePath: "/documents/cases/work_contract_001.pdf",
        fileSize: 234567,
        caseId: cases[3].id,
        clientId: clients[3].id,
      },
      {
        title: "شهادة وفاة",
        documentType: "id_document",
        description: "شهادة وفاة المورث",
        filePath: "/documents/cases/death_cert_001.pdf",
        fileSize: 156789,
        caseId: cases[4].id,
        clientId: clients[4].id,
      },
      {
        title: "سند ملكية",
        documentType: "evidence",
        description: "سند ملكية الأرض",
        filePath: "/documents/cases/property_deed_001.pdf",
        fileSize: 345678,
        notes: "وثيقة أساسية للقضية",
        caseId: cases[6].id,
        clientId: clients[6].id,
      },
      {
        title: "حكم قضائي",
        documentType: "correspondence",
        description: "نسخة من الحكم الابتدائي",
        filePath: "/documents/cases/verdict_001.pdf",
        fileSize: 567890,
        notes: "حكم تم استئنافه",
        caseId: cases[7].id,
        clientId: clients[7].id,
      },
    ]);
    console.log(`   ✓ Created ${await Document.count()} documents\n`);

    console.log("⚙️ Creating settings...");
    await Setting.bulkCreate([
      {
        key: "officeName",
        value: "مكتب الأستاذ أحمد بن محمد للمحاماة",
        category: "general",
        description: "اسم المكتب",
      },
      {
        key: "officeAddress",
        value: "الجزائر العاصمة، حي النصر، عمارة رقم 25، الطابق الثالث",
        category: "general",
        description: "عنوان المكتب",
      },
      {
        key: "officePhone",
        value: "021 XX XX XX",
        category: "general",
        description: "هاتف المكتب",
      },
      {
        key: "officeEmail",
        value: "contact@lawoffice.dz",
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
        value: "123456789012345",
        category: "general",
        description: "الرقم الجبائي",
      },
      {
        key: "registrationNumber",
        value: "REG-2024-001",
        category: "general",
        description: "رقم التسجيل",
      },
      {
        key: "bankName",
        value: "بنك الجزائر الخارجي",
        category: "financial",
        description: "اسم البنك",
      },
      {
        key: "bankAccountNumber",
        value: "0123456789",
        category: "financial",
        description: "رقم الحساب البنكي",
      },
      {
        key: "bankIBAN",
        value: "DZ59 0001 0000 0123 4567 89",
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
    console.log("   Lawyer: lawyer1 / lawyer123");
    console.log("   Assistant: assistant1 / assistant123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the seed function
seedDatabase();
