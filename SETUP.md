# 프로젝트 설정 안내

## 중요: public 폴더 생성 필요

Next.js에서 정적 파일(이미지, SVG 등)을 사용하려면 `public` 폴더가 필요합니다.

프로젝트 루트에 `public` 폴더를 생성하고, `assets` 폴더를 `public/assets`로 복사해주세요.

### Windows PowerShell에서 실행:

```powershell
# 프로젝트 루트에서 실행
New-Item -ItemType Directory -Force -Path "public"
Copy-Item -Path "assets" -Destination "public\assets" -Recurse -Force
```

### 또는 수동으로:

1. 프로젝트 루트에 `public` 폴더 생성
2. `assets` 폴더 전체를 `public` 폴더 안으로 복사
3. 최종 구조: `public/assets/main/...`

이렇게 하면 `/assets/main/etc/logo.svg` 같은 경로로 이미지에 접근할 수 있습니다.
