# Anipharm Client 🐾

반려동물을 위한 건강 관리 및 병원/약국 검색 서비스

## 📱 프로젝트 소개

Anipharm은 반려동물의 건강 관리를 돕고, 주변 동물병원과 약국을 쉽게 찾을 수 있는 모바일 애플리케이션입니다.

### 주요 기능

- 🏥 **병원/약국 검색**: 주변 동물병원과 약국을 지도에서 확인
- 🤖 **AI 챗봇 상담**: 반려동물의 건강 상태 및 케어 관리 상담
- 🐶 **반려동물 프로필**: 반려동물 정보 관리
- 📝 **건강 일지**: 반려동물의 건강 기록 관리
- 👥 **커뮤니티**: 반려동물 보호자들과 정보 공유

## 🚀 시작하기

### 필요 조건

- Node.js 16 이상
- npm 또는 yarn
- Expo CLI

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/anipharm.git
cd anipharm/Client_Anipharm

# 의존성 설치
npm install

# 개발 서버 시작
npx expo start
```

### 실행

```bash
# iOS
npx expo start --ios

# Android
npx expo start --android

# Web
npx expo start --web
```

## 📁 프로젝트 구조

```
Client_Anipharm/
├── src/
│   ├── components/       # 재사용 가능한 UI 컴포넌트
│   │   ├── common/      # 공통 컴포넌트
│   │   ├── home/        # 홈 화면 컴포넌트
│   │   ├── auth/        # 인증 컴포넌트
│   │   └── pet/         # 반려동물 컴포넌트
│   ├── screens/         # 화면 컴포넌트
│   │   ├── home/        # 홈 화면
│   │   ├── auth/        # 로그인/회원가입
│   │   ├── pet/         # 반려동물 프로필
│   │   └── chatbot/     # 챗봇 상담
│   ├── services/        # API 및 비즈니스 로직
│   ├── types/           # TypeScript 타입 정의
│   └── config/          # 설정 파일
├── App.tsx              # 앱 엔트리 포인트
└── index.ts             # 앱 등록
```

## 🛠️ 기술 스택

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: React Hooks (useState, useEffect)
- **Navigation**: Custom Screen Management
- **Maps**: Naver Maps API
- **UI Components**: Custom Component Library
- **HTTP Client**: Axios
- **Icons**: Expo Vector Icons

## 📚 개발 가이드

### 빠른 시작
새로운 기능을 개발하기 전에 아래 문서들을 참고하세요:

- **[빠른 시작 가이드](./docs/QUICK_START.md)** - 체크리스트와 빠른 참조
- **[개발 가이드](./docs/DEVELOPMENT_GUIDE.md)** - 자세한 개발 방법론
- **[Custom Hooks 가이드](./docs/HOOKS_GUIDE.md)** - Hooks 만들기
- **[컴포넌트 문서](./docs/COMPONENTS.md)** - 컴포넌트 사용법

### 새 기능 개발 순서

1. **타입 정의** → `src/types/`
2. **API 서비스** → `src/services/`
3. **컴포넌트** → `src/components/[feature]/`
4. **화면** → `src/screens/[feature]/`

### 컴포넌트 사용 예시

```tsx
import { Button, Input, Header } from '../../components/common';
import { SearchBar, FilterButtons } from '../../components/home';

const MyScreen = () => {
  const [email, setEmail] = useState('');

  return (
    <View>
      <Header title="내 화면" />
      <Input
        label="이메일"
        value={email}
        onChangeText={setEmail}
      />
      <Button
        title="제출"
        onPress={handleSubmit}
      />
    </View>
  );
};
```

## 🎨 디자인 시스템

### 색상
```tsx
primary: '#FF8A3D'        // 메인 오렌지
primaryLight: '#FFF5EF'   // 연한 오렌지 배경
text: '#333'              // 기본 텍스트
textLight: '#666'         // 보조 텍스트
textMuted: '#999'         // 흐린 텍스트
error: '#FF4444'          // 에러
success: '#4CAF50'        // 성공
background: '#F9F9F9'     // 배경
```

### 간격
```tsx
xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 20px, xxl: 24px
```

### Border Radius
```tsx
sm: 8px, md: 12px, lg: 16px, xl: 20px
```

## 🧪 테스트

```bash
# 타입 체크
npx tsc --noEmit

# (Jest 설정 시) 테스트 실행
npm test
```

## 📦 빌드

```bash
# Web 빌드
npx expo export --platform web

# Android APK
eas build --platform android

# iOS IPA
eas build --platform ios
```

## 🔧 문제 해결

### Metro Bundler 에러
```bash
rm -rf node_modules/.cache .expo
npx expo start --clear
```

### 의존성 에러
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
style: 스타일 변경 (코드 포맷팅 등)
refactor: 코드 리팩토링
docs: 문서 수정
test: 테스트 코드 추가/수정
chore: 빌드 작업, 패키지 매니저 설정 등
```

## 📄 라이센스

This project is licensed under the MIT License.

## 👥 팀

- **Backend**: [Backend Repository](https://github.com/your-org/anipharm-server)
- **Frontend**: [Frontend Repository](https://github.com/your-org/anipharm-client)

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

Made with ❤️ for 🐾
