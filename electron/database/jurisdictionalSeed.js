import { sequelize } from './config.js';
import JudicialCouncil from './models/JudicialCouncil.js';
import FirstDegreeCourt from './models/FirstDegreeCourt.js';
import AdministrativeAppealCourt from './models/AdministrativeAppealCourt.js';
import AdministrativeCourt from './models/AdministrativeCourt.js';
import SpecializedCommercialCourt from './models/SpecializedCommercialCourt.js';
import SupremeCourt from './models/SupremeCourt.js';
import SupremeChamber from './models/SupremeChamber.js';

/**
 * Seeds the database with Algerian jurisdictional data
 * This includes: Judicial Councils, First Degree Courts, Supreme Court, Administrative Courts, and Commercial Courts
 */
async function seedJurisdictionalData() {
  try {
    console.log('Starting jurisdictional data seeding...');

    // Check if data already exists
    const councilCount = await JudicialCouncil.count();
    const supremeCourtCount = await SupremeCourt.count();

    if (councilCount > 0 && supremeCourtCount > 0) {
      console.log('Jurisdictional data already exists. Skipping seed.');
      return;
    }

    // Seed Ordinary Judiciary (القضاء العادي)
    if (councilCount === 0) {
      await seedOrdinaryJudiciary();
    } else {
      console.log('✓ Judicial Councils already seeded, skipping...');
    }

    // Seed Supreme Court (المحكمة العليا)
    if (supremeCourtCount === 0) {
      await seedSupremeCourt();
    } else {
      console.log('✓ Supreme Court already seeded, skipping...');
    }

    // Seed Administrative Judiciary (القضاء الإداري)
    const adminAppealCount = await AdministrativeAppealCourt.count();
    if (adminAppealCount === 0) {
      await seedAdministrativeJudiciary();
    } else {
      console.log('✓ Administrative Courts already seeded, skipping...');
    }

    // Seed Commercial Judiciary (القضاء التجاري)
    const commercialCount = await SpecializedCommercialCourt.count();
    if (commercialCount === 0) {
      await seedCommercialJudiciary();
    } else {
      console.log('✓ Commercial Courts already seeded, skipping...');
    }

    console.log('✓ Jurisdictional data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding jurisdictional data:', error);
    throw error;
  }
}

/**
 * Seeds Judicial Councils and First Degree Courts
 */
async function seedOrdinaryJudiciary() {
  console.log('Seeding Ordinary Judiciary...');

  // 48 Judicial Councils (مجالس القضاء) - One per Wilaya
  const councilsData = [
    { id: 1, name: 'أدرار', phone: '040.00.00.00 / 040.00.02.61', email: 'c-adrar@mjustice.dz', website: 'https://courdadrar.mjustice.dz', address: 'شارع محمد العطشان ادرار.', receptionDays: 'رئيس المجلس: الاثنين- الأربعاء. النائب العام: الأربعاء.' },
    { id: 2, name: 'الشلف', phone: '020.64.24.32 / 020.64.29.88', email: 'c-chlef@mjustice.dz', website: 'https://cour-chlef.mjustice.dz', address: 'طريق المحاجر. الشلف.', receptionDays: 'رئيس المجلس: الأربعاء. النائب العام: كل أيام الأسبوع.' },
    { id: 3, name: 'الأغواط', phone: '029.13.20.42', email: 'c-laghouat@mjustice.dz', website: 'https://courdelaghouat.mjustice.dz', address: 'حي بوعامر المعمورة. الأغواط.', receptionDays: 'الإثنين.' },
    { id: 4, name: 'أم البواقي', phone: '032.42.22.00', email: 'c-oumelbouaghi@mjustice.dz', website: 'https://courdoumelbouaghi.mjustice.dz', address: 'شارع 01 نوفمبر. أم البواقي.', receptionDays: 'الأحد - الثلاثاء - الخميس.' },
    { id: 5, name: 'باتنة', phone: '033.31.92.76 / 033.31.92.77', email: 'c-batna@mjustice.dz', website: 'https://courdebatna.mjustice.dz', address: 'طريق بسكرة باتنة 05000 الجزائر', receptionDays: 'رئيس المجلس: الثلاثاء. النائب العام: الإثنين.' },
    { id: 6, name: 'بجاية', phone: '034.12.97.55 / 034.12.97.56', email: 'c-bejaia@mjustice.dz', website: 'https://cour-bejaia.mjustice.dz', address: 'حي طوبال. بجاية.', receptionDays: 'رئيس المجلس: الأربعاء. النائب العام: كل أيام الأسبوع.' },
    { id: 7, name: 'بسكرة', phone: '033.65.62.39 / 033.65.62.44', email: 'c-biskra@mjustice.dz', website: 'https://courdebiskra.mjustice.dz', address: 'مجلس قضاء بسكرة.', receptionDays: 'رئيس المجلس: الأحد. النائب العام: الأحد و الأربعاء.' },
    { id: 8, name: 'بشار', phone: '049.23.46.36 / 049.23.46.38', email: 'c-bechar@mjustice.dz', website: 'https://courdebechar.mjustice.dz', address: 'شارع العقيد شابو. بشار.', receptionDays: 'النائب العام: الثلاثاء. رئيس المجلس: الاثنين.' },
    { id: 9, name: 'البليدة', phone: '025.23.38.17 / 025.23.38.18', email: 'c-blida@mjustice.dz', website: 'https://cour-blida.mjustice.dz', address: 'شارع 11 ديسمبر 1960، سيدي عبد القادر، البليدة.', receptionDays: 'النائب العام: الاثنين. رئيس المجلس: الثلاثاء.' },
    { id: 10, name: 'البويرة', phone: '026.72.38.93/94', email: 'c-bouira@mjustice.dz', website: 'https://courdebouira.mjustice.dz', address: 'حي الاخوة بوصندالة، 10000 البويرة.', receptionDays: 'النائب العام: الاثنين و الخميس. رئيس المجلس: الأربعاء.' },
    { id: 11, name: 'تمنراست', phone: '029.31.44.11', email: 'c-tamanrasset@mjustice.dz', website: 'https://courdetamanrasset.mjustice.dz', address: 'مجلس قضاء تمنراست', receptionDays: 'كل أيام الاسبوع.' },
    { id: 12, name: 'تبسة', phone: '037.55.09.54 / 037.55.09.56', email: 'c-tebessa@mjustice.dz', website: 'https://courdetebessa.mjustice.dz', address: 'حي السلم 12000. تبسة. الجزائر.', receptionDays: 'النائب العام: الإثنين و الأربعاء. رئيس المجلس: الإثنين و الأربعاء.' },
    { id: 13, name: 'تلمسان', phone: '043.21.48.76 / 043.21.36.53', email: 'c-tlemcen@mjustice.dz', website: 'https://courdetlemcen.mjustice.dz', address: 'إمامة دائرة منصورة، تلمسان.', receptionDays: 'الإثنين.' },
    { id: 14, name: 'تيارت', phone: '046.20.30.84', email: 'c-tiaret@mjustice.dz', website: 'https://courdetiaret.mjustice.dz', address: 'حي الإخوة قيطون. تيارت.', receptionDays: 'النائب العام: الإثنين. رئيس المجلس: الثلاثاء+الأربعاء.' },
    { id: 15, name: 'تيزي وزو', phone: '026.19.75.54 / 026.19.75.70', email: 'c-tiziouzou@mjustice.dz', website: 'https://courdetiziouzou.mjustice.dz', address: 'شارع قنطري الصديق. تيزى وزو.', receptionDays: 'رئيس المجلس: كل الأيام. النائب العام: الإثنين.' },
    { id: 16, name: 'الجزائر', phone: '021.77.01.52', email: 'c-alger@mjustice.dz', website: 'https://cour-alger.mjustice.dz', address: 'نهج فرنان حنفي - الجزائر', receptionDays: 'النائب العام: الخميس. رئيس المجلس: الثلاثاء.' },
    { id: 17, name: 'الجلفة', phone: '027.92.15.18 / 027.92.15.19', email: 'c-djelfa@mjustice.dz', website: 'https://courdedjelfa.mjustice.dz', address: 'حي العقيد محمد شعباني.', receptionDays: 'الإثنين.' },
    { id: 18, name: 'جيجل', phone: '034.49.71.13 / 034.49.72.12', email: 'c-jijel@mjustice.dz', website: 'https://courdejijel.mjustice.dz', address: 'شارع أول نوفمبر . جيجل.', receptionDays: 'النائب العام: كل يوم الإثنين. رئيس المجلس: كل يوم ثلاثاء.' },
    { id: 19, name: 'سطيف', phone: '036.82.11.88 / 036.82.11.00', email: 'c-setif@mjustice.dz', website: 'https://cour-setif.mjustice.dz/', address: 'شارع الشيخ العيفة. سطيف.', receptionDays: 'الرئاسة: الإثنين. النيابة: الاثنين و الاربعاء.' },
    { id: 20, name: 'سعيدة', phone: '048.51.15.15 / 048.51.15.16', email: 'c-saida@mjustice.dz', website: 'https://courdesaida.mjustice.dz', address: 'قصر العدالة. سعيدة.', receptionDays: 'النائب العام: الثلاثاء. رئيس المجلس: الاثنين.' },
    { id: 21, name: 'سكيكدة', phone: '038.76.59.32 / 038.76.14.28', email: 'c-skikda@mjustice.dz', website: 'https://courdeskikda.mjustice.dz', address: 'حي الممرات 20 أوث 1955 سكيكدة.', receptionDays: 'النائب العام: يوميا. رئيس المجلس: الأربعاء.' },
    { id: 22, name: 'سيدي بلعباس', phone: '048.77.12.14 / 048.77.12.15', email: 'c-sbelabbes@mjustice.dz', website: 'https://courdesidibelabbes.mjustice.dz', address: 'مجلس قضاء سيدي بلعباس، شارع مصالي الحاج.', receptionDays: 'النائب العام: يوميا. رئيس المجلس: الأربعاء.' },
    { id: 23, name: 'عنابة', phone: '038.40.66.13 /038.40.66.14', email: 'c-annaba@mjustice.dz', website: 'https://courdannaba.mjustice.dz', address: 'نهج بن زعيم عبد العزيز. عنابة.', receptionDays: 'النائب العام: الثلاثاء. رئيس المجلس: الأربعاء.' },
    { id: 24, name: 'قالمة', phone: '037.11.63.75', email: 'c-guelma@mjustice.dz', website: 'https://courdeguelma.mjustice.dz', address: 'طريق الجامعة. قالمة.', receptionDays: 'النائب العام: الاثنين. رئيس المجلس: الأربعاء.' },
    { id: 25, name: 'قسنطينة', phone: '031.69.59.35', email: 'c-constantine@mjustice.dz', website: 'https://courdeconstantine.mjustice.dz', address: 'مجلس قضاء قسنطينة.', receptionDays: 'يوميا.' },
    { id: 26, name: 'المدية', phone: '025.80.02.40 / 025.80.02.46', email: 'c-medea@mjustice.dz', website: 'https://cour-medea.mjustice.dz', address: 'حي ثنية الحجر. المدية.', receptionDays: 'رئيس المجلس: الثلاثاء. النائب العام: كل أيام الأسبوع.' },
    { id: 27, name: 'مستغانم', phone: '045.40.97.50', email: 'c-moustaghanem@mjustice.dz', website: 'https://cour-mostaganem.mjustice.dz', address: 'طريق وهران. مستغانم.', receptionDays: 'النائب العام: كل أيام الأسبوع. رئيس المجلس : الأربعاء.' },
    { id: 28, name: 'المسيلة', phone: '035.35.05.21 / 035.35.05.20', email: 'c-msila@mjustice.dz', website: 'https://courdemsila.mjustice.dz', address: 'الحي الإداري. المسيلة.', receptionDays: 'رئيس المجلس: الإثنين. النائب العام: كل أيام الأسبوع.' },
    { id: 29, name: 'معسكر', phone: '045.72.40.74', email: 'c-mascara@mjustice.dz', website: 'https://courdemascara.mjustice.dz', address: 'الحي الإداري. معسكر.', receptionDays: 'الإثنين.' },
    { id: 30, name: 'ورقلة', phone: '029.71.58.14', email: 'c-ouargla@mjustice.dz', website: 'https://courdeouargla.mjustice.dz', address: 'الطريق الوطني رقم 49 في إتجاه مدينة غرداية.', receptionDays: 'رئيس المجلس: الثلاثاء. النائب العام: يوميا صباحا.' },
    { id: 31, name: 'وهران', phone: '/', email: 'c-oran@mjustice.dz', website: 'https://courdoran.mjustice.dz', address: 'قصر العدالة، ساحة الأستاذ تيفني، وهران.', receptionDays: 'النائب العام: كل يوم. رئيس المجلس: الثلاثاء.' },
    { id: 32, name: 'البيض', phone: '049.61.38.38 - 049.61.38.27', email: 'c-elbayadh@mjustice.dz', website: 'https://courdelbayadh.mjustice.dz', address: 'ساحة طرابلس. البيض.', receptionDays: 'رئيس المجلس: الأربعاء. النائب العام: الإثنين.' },
    { id: 33, name: 'إيليزي', phone: '029.41.12.08', email: 'c-ilizi@mjustice.dz', website: 'https://courdillizi.mjustice.dz', address: 'المنطقة الحضرية. إليزي.', receptionDays: 'كل أيام الأسبوع.' },
    { id: 34, name: 'برج بوعريريج', phone: '035.76.44.26', email: 'c-bba@mjustice.dz', website: 'https://courdebordjbouarreridj.mjustice.dz', address: 'شارع هواري بومدين. حي 5 جويلية. برج بوعريريج.', receptionDays: 'رئيس المجلس: يوم الإثنين. النائب العام: كل أيام الأسبوع.' },
    { id: 35, name: 'بومرداس', phone: '024.79.58.88 / 024.79.58.93', email: 'c-boumerdes@mjustice.dz', website: 'https://courdeboumerdes.mjustice.dz', address: 'شارع الفيلات الحي الإداري. بومرداس.', receptionDays: 'النائب العام: كل يـوم. رئيس المجلس: الأربعـاء.' },
    { id: 36, name: 'الطارف', phone: '/', email: 'c-taref@mjustice.dz', website: 'https://courdeltarf.mjustice.dz', address: 'نهج الشهيد تين خميس.', receptionDays: 'النائب العام: طيلة أيام الاسبوع. رئيس المجلس: الثلاثاء.' },
    { id: 37, name: 'تندوف', phone: '049.38.80.66', email: 'c-tindouf@mjustice.dz', website: 'https://courdetindouf.mjustice.dz', address: 'حي تندوف لطفي. بلدية تندوف. ولاية تندوف.', receptionDays: 'الأربعاء' },
    { id: 38, name: 'تيسمسيلت', phone: '046.54.10.20', email: 'c-tissemsilt@mjustice.dz', website: 'https://courdetissemsilt.mjustice.dz', address: 'شارع المجاهد نوقار المختار طريق الجزائر تيسمسيلت', receptionDays: 'الثلاثاء.' },
    { id: 39, name: 'الوادي', phone: '032.13.89.96', email: 'c-eloued@mjustice.dz', website: 'https://courdeloued.mjustice.dz', address: 'مجلس قضاء الوادي', receptionDays: 'رئيس المجلس : الاربعاء. النائب العام : الاربعاء.' },
    { id: 40, name: 'خنشلة', phone: '032.72.77.31 / 032.72.77.32', email: 'c-khenchela@mjustice.dz', website: 'https://courdekhenchela.mjustice.dz', address: 'حي 90 سكن خنشلة', receptionDays: 'الاثنين.' },
    { id: 41, name: 'سوق أهراس', phone: '037.72.45.69', email: 'c-soukahras@mjustice.dz', website: 'https://courdesoukahras.mjustice.dz', address: 'طريق تونس. سوق أهراس', receptionDays: 'النائب العام: الاحد, الاثنين, الثلاثاء و الأربعاء. رئيس المجلس: الاثنين.' },
    { id: 42, name: 'تيبازة', phone: '024.37.63.18', email: 'c-tipaza@mjustice.dz', website: 'https://courdetipaza.mjustice.dz', address: 'المدينة الجديدة تيبازة.', receptionDays: 'النائب العام: كل يوم. رئيس المجلس: الثلاثاء.' },
    { id: 43, name: 'ميلة', phone: '031.46.56.66', email: 'c-mila@mjustice.dz', website: 'https://courdemila.mjustice.dz', address: 'شارع سايغي أحمد ميلة', receptionDays: 'رئيس المجلس: يوم الثلاثاء. النائب العام: يوم الإثنين.' },
    { id: 44, name: 'عين الدفلى', phone: '027.50.53.75', email: 'c-aindefla@mjustice.dz', website: 'https://cour-aindefla.mjustice.dz', address: 'الحي الإداري عين الدفلى.', receptionDays: 'النائب العام: كل أيام الأسبوع. رئيس المجلس: الأربعاء.' },
    { id: 45, name: 'النعامة', phone: '049.59.55.92', email: 'c-naama@mjustice.dz', website: 'https://courdenaama.mjustice.dz', address: 'الحي الإداري. النعامة', receptionDays: 'الإثنين.' },
    { id: 46, name: 'عين تيموشنت', phone: '043.79.21.64 / 043.79.21.09', email: 'c-aintemouchent@mjustice.dz', website: 'https://courdeaintemouchent.mjustice.dz', address: 'شارع معاشو محمد حي سيدي سعيد', receptionDays: 'كل يوم.' },
    { id: 47, name: 'غرداية', phone: '029.25.94.72', email: 'c-ghardaia@mjustice.dz', website: 'https://courdeghardaia.mjustice.dz', address: 'حي بوهراوة. غرداية.', receptionDays: 'النائب العام: الأحد و الثلاثاء. رئيس المجلس: الإثنين.' },
    { id: 48, name: 'غليزان', phone: '046.76.92.98', email: 'c-relizane@mjustice.dz', website: 'https://courderelizane.mjustice.dz', address: 'حي الانتصار غليزان.', receptionDays: 'النائب العام: كل أيام الأسبوع. رئيس المجلس: الإثنين.' }
  ];

  await JudicialCouncil.bulkCreate(councilsData);

  // First Degree Courts (محاكم الدرجة الأولى) including branches (فروع)
  const courtsData = [
    // Adrar (1)
    { name: 'محكمة أدرار', councilId: 1, isBranch: false }, { name: 'محكمة اولف', councilId: 1, isBranch: false }, { name: 'محكمة رقان', councilId: 1, isBranch: false }, { name: 'محكمة تيميمون', councilId: 1, isBranch: false }, { name: 'فرع برج باجي مختار', councilId: 1, isBranch: true },
    // Chlef (2)
    { name: 'محكمة الشلف', councilId: 2, isBranch: false }, { name: 'محكمة بوقادر', councilId: 2, isBranch: false }, { name: 'محكمة تنس', councilId: 2, isBranch: false }, { name: 'فرع عين مران', councilId: 2, isBranch: true }, { name: 'فرع الشطية', councilId: 2, isBranch: true },
    // Laghouat (3)
    { name: 'محكمة الأغواط', councilId: 3, isBranch: false }, { name: 'محكمة أفلو', councilId: 3, isBranch: false }, { name: 'محكمة عين ماضي', councilId: 3, isBranch: false },
    // Oum El Bouaghi (4)
    { name: 'محكمة أم البواقي', councilId: 4, isBranch: false }, { name: 'محكمة عين البيضاء', councilId: 4, isBranch: false }, { name: 'محكمة عين مليلة', councilId: 4, isBranch: false }, { name: 'محكمة مسكيانة', councilId: 4, isBranch: false }, { name: 'محكمة عين الفكرون', councilId: 4, isBranch: false },
    // Batna (5)
    { name: 'محكمة باتنة', councilId: 5, isBranch: false }, { name: 'محكمة عين التوتة', councilId: 5, isBranch: false }, { name: 'محكمة اريس', councilId: 5, isBranch: false }, { name: 'محكمة بريكة', councilId: 5, isBranch: false }, { name: 'محكمة مروانة', councilId: 5, isBranch: false }, { name: 'محكمة نقاوس', councilId: 5, isBranch: false }, { name: 'فرع راس العيون', councilId: 5, isBranch: true },
    // Bejaia (6)
    { name: 'محكمة بجاية', councilId: 6, isBranch: false }, { name: 'محكمة اميزور', councilId: 6, isBranch: false }, { name: 'محكمة اقبو', councilId: 6, isBranch: false }, { name: 'فرع تازمالت', councilId: 6, isBranch: true }, { name: 'محكمة خراطة', councilId: 6, isBranch: false }, { name: 'محكمة سيدي عيش', councilId: 6, isBranch: false }, { name: 'فرع القصر', councilId: 6, isBranch: true },
    // Biskra (7)
    { name: 'محكمة بسكرة', councilId: 7, isBranch: false }, { name: 'محكمة أولاد جلال', councilId: 7, isBranch: false }, { name: 'محكمة طولقة', councilId: 7, isBranch: false }, { name: 'محكمة سيدي عقبة', councilId: 7, isBranch: false },
    // Bechar (8)
    { name: 'محكمة بشار', councilId: 8, isBranch: false }, { name: 'محكمة بني عباس', councilId: 8, isBranch: false }, { name: 'محكمة العبادلة', councilId: 8, isBranch: false }, { name: 'محكمة بني ونيف', councilId: 8, isBranch: false }, { name: 'فرع تبلبالة', councilId: 8, isBranch: true }, { name: 'فرع كرزاز', councilId: 8, isBranch: true },
    // Blida (9)
    { name: 'محكمة البليدة', councilId: 9, isBranch: false }, { name: 'محكمة بوفاريك', councilId: 9, isBranch: false }, { name: 'محكمة الأربعاء', councilId: 9, isBranch: false }, { name: 'محكمة العفرون', councilId: 9, isBranch: false },
    // Bouira (10)
    { name: 'محكمة البويرة', councilId: 10, isBranch: false }, { name: 'محكمة سور الغزلان', councilId: 10, isBranch: false }, { name: 'محكمة الأخضرية', councilId: 10, isBranch: false }, { name: 'محكمة أمشدالة', councilId: 10, isBranch: false }, { name: 'محكمة عين بسام', councilId: 10, isBranch: false }, { name: 'فرع برج اخريص', councilId: 10, isBranch: true },
    // Tamanrasset (11)
    { name: 'محكمة تمنراست', councilId: 11, isBranch: false }, { name: 'محكمة عين صالح', councilId: 11, isBranch: false }, { name: 'محكمة عين قزام', councilId: 11, isBranch: false }, { name: 'فرع تاظروك', councilId: 11, isBranch: true }, { name: 'فرع تين زواتين', councilId: 11, isBranch: true },
    // Tebessa (12)
    { name: 'محكمة تبسة', councilId: 12, isBranch: false }, { name: 'محكمة بئر العاتر', councilId: 12, isBranch: false }, { name: 'محكمة العوينات', councilId: 12, isBranch: false }, { name: 'محكمة الشريعة', councilId: 12, isBranch: false }, { name: 'فرع محكمة الكويف', councilId: 12, isBranch: true }, { name: 'فرع محكمة الونزة', councilId: 12, isBranch: true },
    // Tlemcen (13)
    { name: 'محكمة تلمسان', councilId: 13, isBranch: false }, { name: 'محكمة مغنية', councilId: 13, isBranch: false }, { name: 'محكمة سبدو', councilId: 13, isBranch: false }, { name: 'محكمة الغزوات', councilId: 13, isBranch: false }, { name: 'محكمة اولاد ميمون', councilId: 13, isBranch: false }, { name: 'محكمة الرمشي', councilId: 13, isBranch: false }, { name: 'محكمة ندرومة', councilId: 13, isBranch: false }, { name: 'محكمة باب العسة', councilId: 13, isBranch: false }, { name: 'فرع سيدي الجيلالي', councilId: 13, isBranch: true },
    // Tiaret (14)
    { name: 'محكمة تيارت', councilId: 14, isBranch: false }, { name: 'محكمة فرندة', councilId: 14, isBranch: false }, { name: 'محكمة قصر الشلالة', councilId: 14, isBranch: false }, { name: 'محكمة السوقر', councilId: 14, isBranch: false },
    // Tizi Ouzou (15)
    { name: 'محكمة تيزي وزو', councilId: 15, isBranch: false }, { name: 'محكمة عين الحمام', councilId: 15, isBranch: false }, { name: 'محكمة عزازقة', councilId: 15, isBranch: false }, { name: 'محكمة واسيف', councilId: 15, isBranch: false }, { name: 'محكمة ذراع الميزان', councilId: 15, isBranch: false }, { name: 'محكمة تيقزيرت', councilId: 15, isBranch: false }, { name: 'محكمة الاربعاء ناث ايراثن', councilId: 15, isBranch: false }, { name: 'فرع ازفون', councilId: 15, isBranch: true },
    // Alger (16)
    { name: 'محكمة سيدي امحمد', councilId: 16, isBranch: false }, { name: 'محكمة دار البيضاء', councilId: 16, isBranch: false }, { name: 'محكمة الحراش', councilId: 16, isBranch: false }, { name: 'محكمة الشراقة', councilId: 16, isBranch: false }, { name: 'محكمة الرويبة', councilId: 16, isBranch: false }, { name: 'محكمة حسين داي', councilId: 16, isBranch: false }, { name: 'محكمة باب الوادي', councilId: 16, isBranch: false }, { name: 'محكمة بئر مراد رايس', councilId: 16, isBranch: false }, { name: 'ملحقة الحراش', councilId: 16, isBranch: true },
    // Djelfa (17)
    { name: 'محكمة الجلفة', councilId: 17, isBranch: false }, { name: 'محكمة حاسي بحبح', councilId: 17, isBranch: false }, { name: 'محكمة مسعد', councilId: 17, isBranch: false }, { name: 'محكمة عين وسارة', councilId: 17, isBranch: false }, { name: 'محكمة الادريسية', councilId: 17, isBranch: false },
    // Jijel (18)
    { name: 'محكمة جيجل', councilId: 18, isBranch: false }, { name: 'محكمة الميلية', councilId: 18, isBranch: false }, { name: 'محكمة الطاهير', councilId: 18, isBranch: false },
    // Setif (19)
    { name: 'محكمة سطيف', councilId: 19, isBranch: false }, { name: 'محكمة بني ورثيلان', councilId: 19, isBranch: false }, { name: 'محكمة عين الكبيرة', councilId: 19, isBranch: false }, { name: 'محكمة عين أزال', councilId: 19, isBranch: false }, { name: 'محكمة عين ولمان', councilId: 19, isBranch: false }, { name: 'محكمة العلمة', councilId: 19, isBranch: false }, { name: 'محكمة بوقاعة', councilId: 19, isBranch: false }, { name: 'فرع بني عزيز', councilId: 19, isBranch: true },
    // Saida (20)
    { name: 'محكمة سعيدة', councilId: 20, isBranch: false }, { name: 'محكمة الحساسنة', councilId: 20, isBranch: false },
    // Skikda (21)
    { name: 'محكمة سكيكدة', councilId: 21, isBranch: false }, { name: 'محكمة عزابة', councilId: 21, isBranch: false }, { name: 'محكمة الحروش', councilId: 21, isBranch: false }, { name: 'محكمة القل', councilId: 21, isBranch: false }, { name: 'محكمة تمالوس', councilId: 21, isBranch: false },
    // Sidi Bel Abbes (22)
    { name: 'محكمة سيدي بلعباس', councilId: 22, isBranch: false }, { name: 'محكمة سفيزف', councilId: 22, isBranch: false }, { name: 'محكمة بن باديس', councilId: 22, isBranch: false }, { name: 'محكمة تلاغ', councilId: 22, isBranch: false }, { name: 'فرع محكمة راس الماء', councilId: 22, isBranch: true },
    // Annaba (23)
    { name: 'محكمة عنابة', councilId: 23, isBranch: false }, { name: 'محكمة برحال', councilId: 23, isBranch: false }, { name: 'محكمة الحجار', councilId: 23, isBranch: false },
    // Guelma (24)
    { name: 'محكمة قالمة', councilId: 24, isBranch: false }, { name: 'محكمة بوشقوف', councilId: 24, isBranch: false }, { name: 'محكمة وادي زناتي', councilId: 24, isBranch: false },
    // Constantine (25)
    { name: 'محكمة قسنطينة', councilId: 25, isBranch: false }, { name: 'محكمة قسنطينة- فرع الزيادية', councilId: 25, isBranch: true }, { name: 'محكمة الخروب', councilId: 25, isBranch: false }, { name: 'محكمة زيغود يوسف', councilId: 25, isBranch: false },
    // Medea (26)
    { name: 'محكمة المدية', councilId: 26, isBranch: false }, { name: 'محكمة قصر البخاري', councilId: 26, isBranch: false }, { name: 'محكمة البرواقية', councilId: 26, isBranch: false }, { name: 'محكمة عين بوسيف', councilId: 26, isBranch: false }, { name: 'محكمة العمارية', councilId: 26, isBranch: false }, { name: 'محكمة تابلاط', councilId: 26, isBranch: false }, { name: 'محكمة بني سليمان', councilId: 26, isBranch: false },
    // Mostaganem (27)
    { name: 'محكمة مستغانم', councilId: 27, isBranch: false }, { name: 'محكمة سيدي علي', councilId: 27, isBranch: false }, { name: 'محكمة عين تادلس', councilId: 27, isBranch: false },
    // M'Sila (28)
    { name: 'محكمة المسيلة', councilId: 28, isBranch: false }, { name: 'محكمة بوسعادة', councilId: 28, isBranch: false }, { name: 'محكمة عين الملح', councilId: 28, isBranch: false }, { name: 'محكمة مقرة', councilId: 28, isBranch: false }, { name: 'محكمة حمام الضلعة', councilId: 28, isBranch: false }, { name: 'محكمة سيدي عيسى', councilId: 28, isBranch: false }, { name: 'محكمة اولاد دراج', councilId: 28, isBranch: false }, { name: 'فرع بن سرور', councilId: 28, isBranch: true }, { name: 'فرع عين الحجل', councilId: 28, isBranch: true },
    // Mascara (29)
    { name: 'محكمة معسكر', councilId: 29, isBranch: false }, { name: 'محكمة سيق', councilId: 29, isBranch: false }, { name: 'محكمة غريس', councilId: 29, isBranch: false }, { name: 'محكمة المحمدية', councilId: 29, isBranch: false }, { name: 'محكمة تيغنيف', councilId: 29, isBranch: false }, { name: 'محكمة بوحنيفية', councilId: 29, isBranch: false },
    // Ouargla (30)
    { name: 'محكمة ورقلة', councilId: 30, isBranch: false }, { name: 'محكمة حاسي مسعود', councilId: 30, isBranch: false }, { name: 'محكمة تقرت', councilId: 30, isBranch: false }, { name: 'فرع محكمة الحجيرة', councilId: 30, isBranch: true }, { name: 'فرع محكمة الطيبات', councilId: 30, isBranch: true },
    // Oran (31)
    { name: 'محكمة وهران', councilId: 31, isBranch: false }, { name: 'محكمة أرزيو', councilId: 31, isBranch: false }, { name: 'محكمة عين الترك', councilId: 31, isBranch: false }, { name: 'محكمة قديل', councilId: 31, isBranch: false }, { name: 'محكمة وادي التليلات', councilId: 31, isBranch: false }, { name: 'محكمة السانية', councilId: 31, isBranch: false }, { name: 'محكمة العثمانية', councilId: 31, isBranch: false }, { name: 'محكمة فلاوسن', councilId: 31, isBranch: false },
    // El Bayadh (32)
    { name: 'محكمة البيض', councilId: 32, isBranch: false }, { name: 'محكمة بوقطب', councilId: 32, isBranch: false }, { name: 'محكمة بوعلام', councilId: 32, isBranch: false }, { name: 'محكمة الابيض سيدي الشيخ', councilId: 32, isBranch: false },
    // Illizi (33)
    { name: 'محكمة إيليزي', councilId: 33, isBranch: false }, { name: 'محكمة جانت', councilId: 33, isBranch: false }, { name: 'محكمة ان امناس', councilId: 33, isBranch: false },
    // Bordj Bou Arreridj (34)
    { name: 'محكمة برج بوعريريج', councilId: 34, isBranch: false }, { name: 'محكمة رأس الوادي', councilId: 34, isBranch: false }, { name: 'محكمة المنصورة', councilId: 34, isBranch: false }, { name: 'محكمة برج زمورة', councilId: 34, isBranch: false }, { name: 'محكمة برج الغدير', councilId: 34, isBranch: false },
    // Boumerdes (35)
    { name: 'محكمة بومرداس', councilId: 35, isBranch: false }, { name: 'محكمة الثنية', councilId: 35, isBranch: false }, { name: 'محكمة دلس', councilId: 35, isBranch: false }, { name: 'محكمة برج منايل', councilId: 35, isBranch: false }, { name: 'محكمة خميس الخشنة', councilId: 35, isBranch: false }, { name: 'محكمة بودواو', councilId: 35, isBranch: false },
    // El Tarf (36)
    { name: 'محكمة الطارف', councilId: 36, isBranch: false }, { name: 'محكمة الذرعان', councilId: 36, isBranch: false }, { name: 'محكمة بوحجار', councilId: 36, isBranch: false }, { name: 'محكمة القالة', councilId: 36, isBranch: false },
    // Tindouf (37)
    { name: 'محكمة تندوف', councilId: 37, isBranch: false },
    // Tissemsilt (38)
    { name: 'محكمة تيسمسيلت', councilId: 38, isBranch: false }, { name: 'محكمة برج بونعامة', councilId: 38, isBranch: false }, { name: 'محكمة ثنية الحد', councilId: 38, isBranch: false }, { name: 'فرع مهدية', councilId: 38, isBranch: true },
    // El Oued (39)
    { name: 'محكمة الوادي', councilId: 39, isBranch: false }, { name: 'محكمة دبيلة', councilId: 39, isBranch: false }, { name: 'محكمة قمار', councilId: 39, isBranch: false }, { name: 'محكمة المغير', councilId: 39, isBranch: false }, { name: 'محكمة جامعة', councilId: 39, isBranch: false }, { name: 'فرع محكمة الرباح', councilId: 39, isBranch: true },
    // Khenchela (40)
    { name: 'محكمة خنشلة', councilId: 40, isBranch: false }, { name: 'محكمة قايس', councilId: 40, isBranch: false }, { name: 'محكمة ششار', councilId: 40, isBranch: false }, { name: 'محكمة اولاد رشاش', councilId: 40, isBranch: false }, { name: 'محكمة بوحمامة', councilId: 40, isBranch: false }, { name: 'فرع عين الطويلة', councilId: 40, isBranch: true },
    // Souk Ahras (41)
    { name: 'محكمة سوق أهراس', councilId: 41, isBranch: false }, { name: 'محكمة سدراتة', councilId: 41, isBranch: false }, { name: 'محكمة تاورة', councilId: 41, isBranch: false },
    // Tipaza (42)
    { name: 'محكمة تيبازة', councilId: 42, isBranch: false }, { name: 'محكمة شرشال', councilId: 42, isBranch: false }, { name: 'محكمة القليعة', councilId: 42, isBranch: false }, { name: 'محكمة حجوط', councilId: 42, isBranch: false },
    // Mila (43)
    { name: 'محكمة ميلة', councilId: 43, isBranch: false }, { name: 'محكمة شلغوم العيد', councilId: 43, isBranch: false }, { name: 'محكمة فرجيوة', councilId: 43, isBranch: false },
    // Ain Defla (44)
    { name: 'محكمة عين الدفلى', councilId: 44, isBranch: false }, { name: 'محكمة خميس مليانة', councilId: 44, isBranch: false }, { name: 'محكمة مليانة', councilId: 44, isBranch: false }, { name: 'محكمة العطاف', councilId: 44, isBranch: false },
    // Naama (45)
    { name: 'محكمة النعامة', councilId: 45, isBranch: false }, { name: 'محكمة عين الصفراء', councilId: 45, isBranch: false }, { name: 'محكمة المشرية', councilId: 45, isBranch: false },
    // Ain Temouchent (46)
    { name: 'محكمة عين تيموشنت', councilId: 46, isBranch: false }, { name: 'محكمة بني صاف', councilId: 46, isBranch: false }, { name: 'محكمة العامرية', councilId: 46, isBranch: false }, { name: 'محكمة حمام بوحجر', councilId: 46, isBranch: false },
    // Ghardaia (47)
    { name: 'محكمة غرداية', councilId: 47, isBranch: false }, { name: 'محكمة متليلي', councilId: 47, isBranch: false }, { name: 'محكمة المنيعة', councilId: 47, isBranch: false }, { name: 'محكمة بريان', councilId: 47, isBranch: false }, { name: 'محكمة القرارة', councilId: 47, isBranch: false },
    // Relizane (48)
    { name: 'محكمة غليزان', councilId: 48, isBranch: false }, { name: 'محكمة وادي ارهيو', councilId: 48, isBranch: false }, { name: 'محكمة عمي موسى', councilId: 48, isBranch: false }, { name: 'محكمة مازونة', councilId: 48, isBranch: false }, { name: 'محكمة زمورة', councilId: 48, isBranch: false }
  ];

  await FirstDegreeCourt.bulkCreate(courtsData);
  console.log(`✓ Seeded ${councilsData.length} Judicial Councils and ${courtsData.length} First Degree Courts`);
}

/**
 * Seeds Administrative Appeal Courts and Administrative Courts
 */
async function seedAdministrativeJudiciary() {
  console.log('Seeding Administrative Judiciary...');

  const appealCourtsData = [
    { id: 1, name: 'الجزائر العاصمة' }, { id: 2, name: 'وهران' }, { id: 3, name: 'قسنطينة' },
    { id: 4, name: 'ورقلة' }, { id: 5, name: 'تامنغست' }, { id: 6, name: 'بشار' }
  ];

  await AdministrativeAppealCourt.bulkCreate(appealCourtsData);

  const courtsData = [
    // Alger Appeal Court (1)
    { name: 'الجزائر', appealCourtId: 1 }, { name: 'بومرداس', appealCourtId: 1 }, { name: 'تيبازة', appealCourtId: 1 }, { name: 'البليدة', appealCourtId: 1 }, { name: 'تيزي وزو', appealCourtId: 1 },
    { name: 'البويرة', appealCourtId: 1 }, { name: 'عين الدفلى', appealCourtId: 1 }, { name: 'المدية', appealCourtId: 1 }, { name: 'الجلفة', appealCourtId: 1 }, { name: 'الأغواط', appealCourtId: 1 },
    { name: 'غرداية', appealCourtId: 1 }, { name: 'المنيعة', appealCourtId: 1 },
    // Oran Appeal Court (2)
    { name: 'وهران', appealCourtId: 2 }, { name: 'مستغانم', appealCourtId: 2 }, { name: 'معسكر', appealCourtId: 2 }, { name: 'البيض', appealCourtId: 2 }, { name: 'تيسمسيلت', appealCourtId: 2 },
    { name: 'عين تموشنت', appealCourtId: 2 }, { name: 'غليزان', appealCourtId: 2 }, { name: 'الشلف', appealCourtId: 2 }, { name: 'تلمسان', appealCourtId: 2 }, { name: 'تيارت', appealCourtId: 2 },
    { name: 'سعيدة', appealCourtId: 2 }, { name: 'سيدي بلعباس', appealCourtId: 2 }, { name: 'النعامة', appealCourtId: 2 },
    // Constantine Appeal Court (3)
    { name: 'قسنطينة', appealCourtId: 3 }, { name: 'سكيكدة', appealCourtId: 3 }, { name: 'عنابة', appealCourtId: 3 }, { name: 'الطارف', appealCourtId: 3 }, { name: 'قالمة', appealCourtId: 3 },
    { name: 'سوق أهراس', appealCourtId: 3 }, { name: 'تبسة', appealCourtId: 3 }, { name: 'أم البواقي', appealCourtId: 3 }, { name: 'خنشلة', appealCourtId: 3 }, { name: 'باتنة', appealCourtId: 3 },
    { name: 'بسكرة', appealCourtId: 3 }, { name: 'أولاد جلال', appealCourtId: 3 }, { name: 'ميلة', appealCourtId: 3 }, { name: 'سطيف', appealCourtId: 3 },
    { name: 'برج بوعريريج', appealCourtId: 3 }, { name: 'المسيلة', appealCourtId: 3 }, { name: 'بجاية', appealCourtId: 3 }, { name: 'جيجل', appealCourtId: 3 },
    // Ouargla Appeal Court (4)
    { name: 'ورقلة', appealCourtId: 4 }, { name: 'الوادي', appealCourtId: 4 }, { name: 'تقرت', appealCourtId: 4 }, { name: 'المغير', appealCourtId: 4 },
    // Tamanrasset Appeal Court (5)
    { name: 'تامنغست', appealCourtId: 5 }, { name: 'عين صالح', appealCourtId: 5 }, { name: 'جانت', appealCourtId: 5 }, { name: 'إيليزي', appealCourtId: 5 },
    // Bechar Appeal Court (6)
    { name: 'بشار', appealCourtId: 6 }, { name: 'تندوف', appealCourtId: 6 }, { name: 'أدرار', appealCourtId: 6 }, { name: 'تيميمون', appealCourtId: 6 }, { name: 'بني عباس', appealCourtId: 6 }
  ];

  await AdministrativeCourt.bulkCreate(courtsData);
  console.log(`✓ Seeded ${appealCourtsData.length} Administrative Appeal Courts and ${courtsData.length} Administrative Courts`);
}

/**
 * Seeds Specialized Commercial Courts
 */
async function seedCommercialJudiciary() {
  console.log('Seeding Specialized Commercial Judiciary...');

  const commercialCourtsData = [
    { name: 'المحكمة التجارية بالجزائر', jurisdictionDetails: 'الجزائر، بومرداس، تيزي وزو، البويرة' },
    { name: 'المحكمة التجارية بالبليدة', jurisdictionDetails: 'البليدة، تيبازة، المدية، عين الدفلى' },
    { name: 'المحكمة التجارية بقسنطينة', jurisdictionDetails: 'قسنطينة، ميلة، جيجل، سكيكدة، أم البواقي، خنشلة' },
    { name: 'المحكمة التجارية بسطيف', jurisdictionDetails: 'سطيف، بجاية، برج بوعريريج، المسيلة، باتنة' },
    { name: 'المحكمة التجارية بعنابة', jurisdictionDetails: 'عنابة، قالمة، سوق أهراس، الطارف، تبسة' },
    { name: 'المحكمة التجارية بوهران', jurisdictionDetails: 'وهران، عين تموشنت، معسكر' },
    { name: 'المحكمة التجارية بمستغانم', jurisdictionDetails: 'مستغانم، الشلف، غليزان' },
    { name: 'المحكمة التجارية بتلمسان', jurisdictionDetails: 'تلمسان، سيدي بلعباس، سعيدة، النعامة، البيض' },
    { name: 'المحكمة التجارية بورقلة', jurisdictionDetails: 'ورقلة، الوادي، تقرت، المغير، بسكرة، أولاد جلال، غرداية، المنيعة' },
    { name: 'المحكمة التجارية ببشار', jurisdictionDetails: 'بشار، تندوف، أدرار، تيميمون، بني عباس' },
    { name: 'المحكمة التجارية بتامنغست', jurisdictionDetails: 'تامنغست، عين صالح، عين قزام، برج باجي مختار، جانت، إيليزي' },
    { name: 'المحكمة التجارية بالجلفة', jurisdictionDetails: 'الجلفة، الأغواط، تيارت، تيسمسيلت' }
  ];

  await SpecializedCommercialCourt.bulkCreate(commercialCourtsData);
  console.log(`✓ Seeded ${commercialCourtsData.length} Specialized Commercial Courts`);
}

/**
 * Seeds Supreme Court and its chambers
 */
async function seedSupremeCourt() {
  console.log('Seeding Supreme Court...');

  // Create the Supreme Court
  const supremeCourt = await SupremeCourt.create({
    id: 1,
    name: 'المحكمة العليا',
    phone: '021 60 29 29 / 021 60 48 48',
    email: 'contact@cs.mj.dz',
    website: 'https://www.cs.mj.dz',
    address: 'شارع محمد عبده، حسين داي، الجزائر',
    receptionDays: 'من الأحد إلى الخميس'
  });

  console.log('✓ Created Supreme Court');

  // Create the chambers of the Supreme Court
  const chambers = [
    {
      name: 'الغرفة المدنية',
      chamberType: 'civil',
      supremeCourtId: supremeCourt.id,
      description: 'تختص بالنظر في الطعون المدنية'
    },
    {
      name: 'الغرفة العقارية',
      chamberType: 'real_estate',
      supremeCourtId: supremeCourt.id,
      description: 'تختص بالنظر في الطعون العقارية'
    },
    {
      name: 'غرفة شؤون الأسرة والمواريث',
      chamberType: 'family',
      supremeCourtId: supremeCourt.id,
      description: 'تختص بالنظر في الطعون المتعلقة بشؤون الأسرة والمواريث'
    },
    {
      name: 'الغرفة التجارية والبحرية',
      chamberType: 'commercial',
      supremeCourtId: supremeCourt.id,
      description: 'تختص بالنظر في الطعون التجارية والبحرية'
    },
    {
      name: 'الغرفة الاجتماعية',
      chamberType: 'social',
      supremeCourtId: supremeCourt.id,
      description: 'تختص بالنظر في الطعون الاجتماعية'
    },
    {
      name: 'الغرفة الجنائية',
      chamberType: 'criminal',
      supremeCourtId: supremeCourt.id,
      description: 'تختص بالنظر في الطعون الجنائية'
    },
    {
      name: 'غرفة الجنح والمخالفات',
      chamberType: 'misdemeanor',
      supremeCourtId: supremeCourt.id,
      description: 'تختص بالنظر في الطعون المتعلقة بالجنح والمخالفات'
    }
  ];

  await SupremeChamber.bulkCreate(chambers);
  console.log(`✓ Seeded ${chambers.length} Supreme Court Chambers`);
}

export { seedJurisdictionalData };
