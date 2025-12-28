# 인증 플로우 테스트 시나리오

## 현재 구현 상태

### 1. 앱 시작 시
- `App.tsx useEffect` (71-107줄)에서 `checkAuth()` 호출
- 토큰이 있으면 → 홈 화면
- 토큰이 없으면 → 로그인 화면

### 2. 로그인하지 않은 사용자
- `currentScreen === 'login'` → LoginScreen 표시
- LoginScreen에서 "회원가입" 버튼 클릭 → SignUpScreen

### 3. 회원가입 플로우
- SignUpScreen에서 4단계 진행 (이메일 → 비밀번호 → 비밀번호 확인 → 닉네임)
- 회원가입 완료 → SuccessModal 표시
- "로그인하러 가기" 버튼 클릭 → LoginScreen

### 4. 로그인 플로우
- LoginScreen에서 이메일/비밀번호 입력
- 로그인 성공 → `onLoginSuccess(user)` 호출
- App.tsx `handleLoginSuccess` (65-68줄)에서:
  - `setUserData(user)`
  - `setCurrentScreen('home')`
- HomeScreen 표시

### 5. 로그인된 사용자 보호
- App.tsx (407-411줄): `useEffect`로 인증 상태 모니터링
- App.tsx (425-430줄): `!userData`이면 LoginScreen 강제 표시
- API 401 에러 시 → EventEmitter로 로그아웃 이벤트 → LoginScreen

## ✅ 결론
모든 플로우가 완벽하게 구현되어 있습니다!
