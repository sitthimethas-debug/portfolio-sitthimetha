require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function seedDatabase() {
  console.log('🚀 Connecting to Neon Postgres Database...');
  
  try {
    // 1. Create Tables
    console.log('📦 Creating database tables if not exist...');

    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_profile (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        role_th VARCHAR(255) NOT NULL,
        role_en VARCHAR(255) NOT NULL,
        experience_years VARCHAR(50) NOT NULL,
        bio TEXT NOT NULL,
        degree_th VARCHAR(255) NOT NULL,
        degree_major VARCHAR(255) NOT NULL,
        university VARCHAR(255) NOT NULL,
        grad_year VARCHAR(50) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS work_experience (
        id SERIAL PRIMARY KEY,
        period VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        sort_order INT DEFAULT 0
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(255) NOT NULL,
        year VARCHAR(50) NOT NULL,
        tag VARCHAR(100) NOT NULL,
        pdf_path VARCHAR(500) NOT NULL,
        thumbnail_path VARCHAR(500) NOT NULL,
        sort_order INT DEFAULT 0
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS innovations (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        features JSONB,
        live_url VARCHAR(500),
        pdf_url VARCHAR(500),
        status_tag VARCHAR(100),
        sort_order INT DEFAULT 0
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS activity_gallery (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_path VARCHAR(500) NOT NULL,
        caption TEXT NOT NULL,
        sort_order INT DEFAULT 0
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS visitor_counter (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(100) UNIQUE NOT NULL,
        visits_count INT DEFAULT 1,
        last_visited TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('✅ Tables created successfully!');

    // 2. Clear and Insert Data
    console.log('🌱 Seeding verified Portfolio data...');

    // Profile
    await sql`DELETE FROM portfolio_profile;`;
    await sql`
      INSERT INTO portfolio_profile (full_name, role_th, role_en, experience_years, bio, degree_th, degree_major, university, grad_year)
      VALUES (
        'นายสิทธิเมธา ศรีบุตรดา',
        'นักวิชาการสาธารณสุข',
        'Public Health Technical Officer',
        'มากกว่า 12 ปี',
        'ยินดีต้อนรับสู่แฟ้มสะสมผลงาน นายสิทธิเมธา ศรีบุตรดา ตำแหน่งนักวิชาการสาธารณสุข (Public Health Technical Officer) มีความรู้ความเชี่ยวชาญและประสบการณ์ทำงานด้านสาธารณสุขและสิ่งแวดล้อมมากกว่า 12 ปี สำเร็จการศึกษาด้านอนามัยสิ่งแวดล้อม มีทักษะและความสามารถในการพัฒนานวัตกรรมดิจิทัล การวิเคราะห์ข้อมูลสุขภาพ และการบริหารจัดการสิ่งแวดล้อมในสถานพยาบาลที่ปฏิบัติงานจริง',
        'ปริญญาตรี วิทยาศาสตรบัณฑิต (วท.บ.)',
        'สาขาอนามัยสิ่งแวดล้อม คณะสาธารณสุขศาสตร์',
        'มหาวิทยาลัยบูรพา',
        'พ.ศ. 2552'
      );
    `;

    // Work Experience
    await sql`DELETE FROM work_experience;`;
    await sql`
      INSERT INTO work_experience (period, title, organization, details, sort_order) VALUES
      (
        'พ.ศ. 2568 - ปัจจุบัน',
        'นักวิชาการสาธารณสุข',
        'กลุ่มงานทรัพยากรบุคคล สถาบันมะเร็งแห่งชาติ กรมการแพทย์',
        '• คณะกรรมการสิ่งแวดล้อมและการจัดการเครื่องมือ (ENV & EQ) สถาบันมะเร็งแห่งชาติ\n• บริหารจัดการระบบสิ่งแวดล้อมโรงพยาบาล พัฒนาเว็บแอปพลิเคชันสารสนเทศ และงานความปลอดภัยอาชีวอนามัย\n• จัดทำโครงการเสริมสร้างภูมิคุ้มกันของบุคลากรสถาบันมะเร็งแห่งชาติ ตรวจสอบและคัดกรองหากลุ่มภูมิคุ้มกันต่ำเพื่อเข้ารับการฉีดวัคซีน ได้แก่ ไวรัสตับอักเสบบี ไวรัสตับอักเสบเอ (ในกลุ่มงานโภชนาการ) ไข้หวัดใหญ่ เป็นต้น',
        1
      ),
      (
        'พ.ศ. 2556 - 2568 (12+ ปี)',
        'นักวิชาการสิ่งแวดล้อม',
        'บริษัท เอส.พี.เอส. คอนซัลติ้งเซอร์วิส จำกัด',
        '• ตรวจวัดสิ่งแวดล้อมในการทำงาน ประเมินผลกระทบสุขภาพและสิ่งแวดล้อม (HIA/EIA)\n• การควบคุมสุขาภิบาลอาหารและน้ำ การจัดการมลพิษ และการให้คำปรึกษามาตรฐาน ISO 14001 & ISO/IEC 17025',
        2
      );
    `;

    // 12 Certificates
    await sql`DELETE FROM certificates;`;
    const certList = [
      {
        title: 'ผู้เชี่ยวชาญด้านการจัดการมูลฝอยและสิ่งปฏิกูล',
        issuer: 'สภาวิชาชีพวิทยาศาสตร์และเทคโนโลยี (เลขที่ 6820110017)',
        year: 'พ.ศ. 2568',
        tag: 'วุฒิบัตรรับรอง',
        pdf: 'Certificate/ผชช.ด้านการจัดการมูลฝอยและสิ่งปฏิกูล.pdf',
        thumb: 'Certificate/thumbnails/ผชช.ด้านการจัดการมูลฝอยและสิ่งปฏิกูล.png',
        order: 1
      },
      {
        title: 'ผู้เชี่ยวชาญด้านการประเมินผลกระทบสุขภาพ',
        issuer: 'สภาวิชาชีพวิทยาศาสตร์และเทคโนโลยี (เลขที่ 6820106018)',
        year: 'พ.ศ. 2568',
        tag: 'วุฒิบัตรรับรอง',
        pdf: 'Certificate/ผชช.ด้านการประเมินผลกระทบสุขภาพ.pdf',
        thumb: 'Certificate/thumbnails/ผชช.ด้านการประเมินผลกระทบสุขภาพ.png',
        order: 2
      },
      {
        title: 'ผู้เชี่ยวชาญด้านอาชีวอนามัยและความปลอดภัย',
        issuer: 'สภาวิชาชีพวิทยาศาสตร์และเทคโนโลยี (เลขที่ 6820107019)',
        year: 'พ.ศ. 2568',
        tag: 'วุฒิบัตรรับรอง',
        pdf: 'Certificate/ผชช.ด้านอาชีวอนามัยและความปลอดภัย.pdf',
        thumb: 'Certificate/thumbnails/ผชช.ด้านอาชีวอนามัยและความปลอดภัย.png',
        order: 3
      },
      {
        title: 'Smart Hospital, Green Environment สู่โรงพยาบาลอัจฉริยะ',
        issuer: 'สมาคมนักบริหารโรงพยาบาลประเทศไทย (สนรท.)',
        year: 'พ.ศ. 2568',
        tag: 'ประกาศนียบัตร',
        pdf: 'Certificate/(สรนท.) Smart Hospital, Green Environment  สู่โรงพยาบาลอัจฉริยะที.pdf',
        thumb: 'Certificate/thumbnails/(สรนท.) Smart Hospital, Green Environment  สู่โรงพยาบาลอัจฉริยะที.png',
        order: 4
      },
      {
        title: 'GREEN & CLEAN Hospital Challenge (ระดับท้าทาย)',
        issuer: 'การจัดการของเสียทางการแพทย์และพลังงาน • กรมอนามัย',
        year: 'พ.ศ. 2568',
        tag: 'ประกาศนียบัตร',
        pdf: 'Certificate/Gree_Clean Challenge.pdf',
        thumb: 'Certificate/thumbnails/Gree_Clean Challenge.png',
        order: 5
      },
      {
        title: 'การบริหารจัดการงานอาชีวอนามัย (OH&S) & สิ่งแวดล้อม (ENV)',
        issuer: 'มาตรฐาน HA รุ่นที่ 4 / สมาคมโรคจากการประกอบอาชีพฯ',
        year: 'พ.ศ. 2568',
        tag: 'ประกาศนียบัตร',
        pdf: 'Certificate/บริหารจัดการงานอาชีวอนามัยอละความปลอดภั.pdf',
        thumb: 'Certificate/thumbnails/บริหารจัดการงานอาชีวอนามัยอละความปลอดภั.png',
        order: 6
      },
      {
        title: 'จรรยาบรรณแห่งวิชาชีพวิทยาศาสตร์และเทคโนโลยี',
        issuer: 'สภาวิชาชีพวิทยาศาสตร์และเทคโนโลยี',
        year: 'พ.ศ. 2567',
        tag: 'วุฒิบัตรรับรอง',
        pdf: 'Certificate/จรรยาบรรณแห่งวิชาชีพวิทยาศาสตร์และเทคโน.pdf',
        thumb: 'Certificate/thumbnails/จรรยาบรรณแห่งวิชาชีพวิทยาศาสตร์และเทคโน.png',
        order: 7
      },
      {
        title: 'ข้อกำหนดมาตรฐาน ISO/IEC 17025:2017',
        issuer: 'กรมวิทยาศาสตร์บริการ (วศ.)',
        year: 'พ.ศ. 2565',
        tag: 'ประกาศนียบัตร',
        pdf: 'Certificate/ข้อกำหนด ISO-IEC 17025-2017.pdf',
        thumb: 'Certificate/thumbnails/ข้อกำหนด ISO-IEC 17025-2017.png',
        order: 8
      },
      {
        title: 'การควบคุมคุณภาพผลการวิเคราะห์ทดสอบ',
        issuer: 'กรมวิทยาศาสตร์บริการ (วศ.)',
        year: 'พ.ศ. 2565',
        tag: 'ประกาศนียบัตร',
        pdf: 'Certificate/การควบคุมคุณภาพผลการวิเคราะห์ทดสอบ.pdf',
        thumb: 'Certificate/thumbnails/การควบคุมคุณภาพผลการวิเคราะห์ทดสอบ.png',
        order: 9
      },
      {
        title: 'Basic Cybersecurity Series',
        issuer: 'ทักษะความมั่นคงปลอดภัยทางไซเบอร์ • TDGA',
        year: 'พ.ศ. 2569',
        tag: 'ใบรับรอง TDGA',
        pdf: 'Certificate/TDGA - Basic Cyber Security.pdf',
        thumb: 'Certificate/thumbnails/TDGA - Basic Cyber Security.png',
        order: 10
      },
      {
        title: 'จุดประกายความคิดเพื่อสร้างนวัตกรรม',
        issuer: 'Building an Innovation Mindset • TDGA',
        year: 'พ.ศ. 2569',
        tag: 'ใบรับรอง TDGA',
        pdf: 'Certificate/TDGA - Building an Innovation Mindset.pdf',
        thumb: 'Certificate/thumbnails/TDGA - Building an Innovation Mindset.png',
        order: 11
      },
      {
        title: 'Digital Literacy ทักษะความเข้าใจดิจิทัล',
        issuer: 'สถาบันพัฒนาบุคลากรภาครัฐด้านดิจิทัล • TDGA',
        year: 'พ.ศ. 2569',
        tag: 'ใบรับรอง TDGA',
        pdf: 'Certificate/TDGA - Digital Literacy.pdf',
        thumb: 'Certificate/thumbnails/TDGA - Digital Literacy.png',
        order: 12
      }
    ];

    for (const c of certList) {
      await sql`
        INSERT INTO certificates (title, issuer, year, tag, pdf_path, thumbnail_path, sort_order)
        VALUES (${c.title}, ${c.issuer}, ${c.year}, ${c.tag}, ${c.pdf}, ${c.thumb}, ${c.order});
      `;
    }

    // 2 Innovations
    await sql`DELETE FROM innovations;`;
    await sql`
      INSERT INTO innovations (title, subtitle, description, features, live_url, pdf_url, status_tag, sort_order) VALUES
      (
        'Green Hospital Portal (NCI Green Hub)',
        'ระบบจัดการสิ่งแวดล้อมโรงพยาบาล สถาบันมะเร็งแห่งชาติ',
        'การสร้างเว็บแอปเพื่อเก็บข้อมูลเป็นศูนย์กลาง การใช้ทรัพยากรด้านต่างๆ ของสถาบันมะเร็งแห่งชาติ เพื่อนำมาคำนวณประสิทธิภาพการใช้พลังงาน การคำนวณคาร์บอนฟุตปริ้นท์ และการคิดสัดส่วนปริมาณขยะมูลฝอยต่อจำนวนผู้รับบริการ/เตียงผู้ป่วย/บุคลากร สำหรับวางแผนการบริหารจัดการสิ่งแวดล้อมในสถานพยาบาลอย่างเป็นรูปธรรมและวัดผลได้จริง',
        ${JSON.stringify([
          'ระบบรวบรวมและวิเคราะห์ข้อมูลการใช้ทรัพยากรแบบรวมศูนย์ (Centralized Hospital Resource Tracking)',
          'คำนวณประสิทธิภาพการใช้พลังงานไฟฟ้า น้ำประปา และเชื้อเพลิงรายอาคาร/รายเดือน',
          'คำนวณคาร์บอนฟุตปริ้นท์องค์กร (Carbon Footprint Calculation) ตามมาตรฐานสากล',
          'คิดสัดส่วนปริมาณขยะมูลฝอย/ขยะติดเชื้อ ต่อจำนวนผู้รับบริการ เตียงผู้ป่วย และบุคลากร'
        ])},
        'https://env-eq-nci.vercel.app/',
        NULL,
        'ระบบใช้งานจริง (LIVE WEB APP)',
        1
      ),
      (
        'Fire Extinguisher EMS',
        'ระบบบริหารจัดการและแจ้งเตือนอายุถังดับเพลิงดิจิทัล',
        'ระบบแจ้งเตือนวันหมดอายุการใช้งาน 10 ปี (Hydrostatic Test Expiration) ผ่านระบบไลน์กลุ่มช่าง เพื่อแก้ปัญหาจุดอ่อนจากการตรวจเช็คแบบเดิมที่ตรวจเพียงเกจวัดแรงดันและน้ำหนัก แต่ไม่ครอบคลุมอายุการใช้งานของตัวถัง ช่วยให้ฝ่ายบริหารและทีมช่างวางแผนจัดซื้อจัดหาล่วงหน้าได้อย่างมีประสิทธิภาพ',
        ${JSON.stringify([
          'ระบบแจ้งเตือนวันหมดอายุการใช้งาน 10 ปี (Hydrostatic Expiration) อัตโนมัติผ่านกลุ่มไลน์ช่าง',
          'แก้ปัญหาจุดอ่อนการตรวจเช็คเดิมที่ดูเฉพาะเกจวัดและน้ำหนัก แต่ไม่ครอบคลุมความเสื่อมสภาพของตัวถัง',
          'ช่วยให้ฝ่ายบริหารและทีมเทคนิคสามารถวางแผนจัดซื้อจัดหาถังดับเพลิงทดแทนล่วงหน้าได้อย่างแม่นยำ',
          'ระบบ Digital Checklist ตรวจสอบพิกัดและสภาพความพร้อมใช้งานประจำเดือน'
        ])},
        NULL,
        'Innovation/fire-extinguisher-ems.pptx.pdf',
        'ไฟล์สไลด์นำเสนอ (PDF PRESENTATION)',
        2
      );
    `;

    // 17 Activity Gallery Photos
    await sql`DELETE FROM activity_gallery;`;
    const photos = [
      { num: 1, file: 'picture/19743.jpg', cap: 'เป็นวิทยากรบรรยายเรื่องสิ่งแวดล้อมและอาชีวอนามัย สำหรับบุคลากรใหม่ในกิจกรรมปฐมนิเทศ NCI : 7 พฤศจิกายน 2568', title: 'ภาพที่ 01 : วิทยากรปฐมนิเทศบุคลากรใหม่' },
      { num: 2, file: 'picture/19749.jpg', cap: 'ได้รับรางวัลชนะเลิศ Upcycle Contest NCI เนื่องในวันสิ่งแวดล้อมโลก 5 มิถุนายน 2568', title: 'ภาพที่ 02 : รางวัลชนะเลิศ Upcycle Contest' },
      { num: 3, file: 'picture/19764_0.jpg', cap: 'นำเสนอและให้คำแนะนำด้านอาชีวอนามัยในงานสัมมนาวิชาการ NCI 1 กรกฎาคม 2569', title: 'ภาพที่ 03 : งานสัมมนาวิชาการ NCI' },
      { num: 4, file: 'picture/19765_0.jpg', cap: 'เป็นผู้ดำเนินรายการร่วม งานกีฬาสี NCI 2568 เมื่อวันที่ 22 ธันวาคม 2568', title: 'ภาพที่ 04 : ผู้ดำเนินรายการกีฬาสี NCI' },
      { num: 5, file: 'picture/S__8503314_0.jpg', cap: 'ได้รับมอบหมายให้ตรวจสอบการรั่วซึมของสารกัมมันตรังสี โดยใช้อุปกรณ์ Survey Meter สำรวจการกระจายตัวของรังสีแกมมา', title: 'ภาพที่ 05 : ตรวจวัดการรั่วซึมสารรังสี' },
      { num: 6, file: 'picture/S__8503315_0.jpg', cap: 'ร่วมกับทีม ENV&EQ เดินตรวจสิ่งแวดล้อมและความปลอดภัยในหน่วยงานต่างๆ', title: 'ภาพที่ 06 : ตรวจสิ่งแวดล้อมและความปลอดภัย' },
      { num: 7, file: 'picture/S__8503316_0.jpg', cap: 'ดำเนินการทดสอบระบบระบายอากาศสำหรับห้องเตรียมยาเคมีบำบัดด้วยวิธี Smoke Pattern', title: 'ภาพที่ 07 : ทดสอบ Smoke Pattern ห้องยาเคมี' },
      { num: 8, file: 'picture/S__8503317_0.jpg', cap: 'สาธิตวิธีการใช้ถังดับเพลิงเบื้องต้นให้กับผู้ป่วยและญาติ ในกิจกรรม Safety Awareness', title: 'ภาพที่ 08 : สาธิตการใช้ถังดับเพลิง' },
      { num: 9, file: 'picture/S__8503318_0.jpg', cap: 'ดำเนินการตรวจวัดก๊าซฟอร์มาลดีไฮด์ในห้องปฏิบัติการพยาธิวิทยา โดยใช้หลอดตรวจวัดสารเคมี (Detector Tube)', title: 'ภาพที่ 09 : ตรวจวัดก๊าซฟอร์มาลดีไฮด์' },
      { num: 10, file: 'picture/S__8503320_0.jpg', cap: 'เข้าช่วยเหลือฟื้นฟูพื้นที่จากเหตุการณ์อุทกภัยดินโคลนถล่ม จังหวัดเชียงราย', title: 'ภาพที่ 10 : ช่วยเหลือฟื้นฟูเหตุอุทกภัย' },
      { num: 11, file: 'picture/S__8503321_0.jpg', cap: 'ดำเนินการตรวจวิเคราะห์สารอินทรีย์ระเหยง่าย (VOCs) ด้วยเครื่อง Gas Chromatography', title: 'ภาพที่ 11 : ตรวจวิเคราะห์สาร VOCs (GC)' },
      { num: 12, file: 'picture/S__8503322_0.jpg', cap: 'เข้ารับการฝึกอบรมการตรวจวัดฝุ่นละอองในปล่องระบายอากาศตามมาตรฐาน US.EPA', title: 'ภาพที่ 12 : ฝึกอบรมตรวจวัดฝุ่นปล่องระบาย' },
      { num: 13, file: 'picture/S__8503323_0.jpg', cap: 'เข้ารับการอบรมเรื่อง Carbon Footprint', title: 'ภาพที่ 13 : การอบรม Carbon Footprint' },
      { num: 14, file: 'picture/S__8503324_0.jpg', cap: 'เข้าร่วมแข่งขัน Green & Clean Hospital Challenge', title: 'ภาพที่ 14 : แข่งขัน Green & Clean Hospital' },
      { num: 15, file: 'picture/S__8503325_0.jpg', cap: 'เป็นหนึ่งในคณะ ENV&EQ เข้ารับรางวัล BKKGC+', title: 'ภาพที่ 15 : คณะ ENV&EQ รับรางวัล BKKGC+' },
      { num: 16, file: 'picture/S__8503326_0.jpg', cap: 'เป็นหนึ่งในคณะ ENV&EQ เข้ารับรางวัล BKKGC+', title: 'ภาพที่ 16 : คณะ ENV&EQ รับรางวัล BKKGC+' },
      { num: 17, file: 'picture/S__8503327_0.jpg', cap: 'ดำเนินการตรวจวัดแสงสว่าง ให้เป็นไปตามเกณฑ์กฎหมายความปลอดภัยและสภาพแวดล้อมในการทำงาน', title: 'ภาพที่ 17 : ตรวจวัดแสงสว่างความปลอดภัย' }
    ];

    for (const p of photos) {
      await sql`
        INSERT INTO activity_gallery (title, image_path, caption, sort_order)
        VALUES (${p.title}, ${p.file}, ${p.cap}, ${p.num});
      `;
    }

    // Visitor Counter Initial
    await sql`
      INSERT INTO visitor_counter (page_name, visits_count)
      VALUES ('portfolio_home', 1)
      ON CONFLICT (page_name) DO UPDATE SET visits_count = visitor_counter.visits_count + 1;
    `;

    console.log('🎉 Database seeded successfully with all Portfolio data!');
    
    // Quick Verification Count
    const certCount = await sql`SELECT COUNT(*) FROM certificates;`;
    const innovCount = await sql`SELECT COUNT(*) FROM innovations;`;
    const galleryCount = await sql`SELECT COUNT(*) FROM activity_gallery;`;
    
    console.log(`📊 Verified Data in Database:`);
    console.log(`   • Certificates: ${certCount[0].count} rows`);
    console.log(`   • Innovations: ${innovCount[0].count} rows`);
    console.log(`   • Gallery Photos: ${galleryCount[0].count} rows`);

  } catch (err) {
    console.error('❌ Database Seeding Error:', err);
    process.exit(1);
  }
}

seedDatabase();
