const { execSync } = require('child_process');

function getGitPath() {
  const possiblePaths = [
    'git',
    'C:\\Users\\hp\\AppData\\Local\\MinGit\\cmd\\git.exe',
    'C:\\Program Files\\Git\\cmd\\git.exe',
    'C:\\Program Files (x86)\\Git\\cmd\\git.exe'
  ];

  for (const p of possiblePaths) {
    try {
      execSync(`"${p}" --version`, { stdio: 'ignore' });
      return p;
    } catch (e) {
      // continue searching
    }
  }
  return 'git';
}

function runGit() {
  const git = getGitPath();
  const commitMsg = process.argv[2] || `Auto-update: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`;

  console.log(`🚀 Using Git: ${git}`);
  console.log(`📦 Staging changes...`);
  execSync(`"${git}" add -A`, { stdio: 'inherit' });

  try {
    const status = execSync(`"${git}" status --porcelain`).toString().trim();
    if (!status) {
      console.log('✅ ไม่มีไฟล์ที่เปลี่ยนแปลง (Nothing to commit)');
      return;
    }
    console.log(`💬 Committing: "${commitMsg}"...`);
    execSync(`"${git}" commit -m "${commitMsg}"`, { stdio: 'inherit' });

    console.log(`⬆️ Pushing to GitHub (origin main)...`);
    execSync(`"${git}" push origin main`, { stdio: 'inherit' });
    console.log('🎉 Push สำเร็จเรียบร้อย! Vercel กำลัง Build & Deploy อัตโนมัติ');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดในการ Push:', err.message);
  }
}

runGit();
