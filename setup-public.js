const fs = require('fs');
const path = require('path');

// 현재 스크립트가 있는 디렉토리 (프로젝트 루트)
const projectRoot = __dirname;
const sourceDir = path.join(projectRoot, 'assets');
const destDir = path.join(projectRoot, 'public', 'assets');

console.log('프로젝트 루트:', projectRoot);
console.log('소스 디렉토리:', sourceDir);
console.log('대상 디렉토리:', destDir);

// public 폴더 생성
const publicDir = path.join(projectRoot, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✓ public 폴더 생성 완료');
} else {
  console.log('✓ public 폴더가 이미 존재합니다');
}

// assets 복사 함수
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) {
    console.error(`소스 경로가 존재하지 않습니다: ${src}`);
    return;
  }
  
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

// assets 폴더 복사
if (fs.existsSync(sourceDir)) {
  if (fs.existsSync(destDir)) {
    console.log('기존 public/assets 폴더를 삭제합니다...');
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  console.log('assets 폴더를 복사합니다...');
  copyRecursiveSync(sourceDir, destDir);
  console.log('✓ assets 폴더 복사 완료');
  console.log(`  ${sourceDir} -> ${destDir}`);
} else {
  console.error('✗ assets 폴더를 찾을 수 없습니다.');
  console.error(`  경로: ${sourceDir}`);
  process.exit(1);
}

console.log('\n✅ public 폴더 설정이 완료되었습니다!');
