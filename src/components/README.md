# Components

Anipharm 앱의 재사용 가능한 UI 컴포넌트들입니다.

## 폴더 구조

```
components/
├── common/          # 공통 UI 컴포넌트
├── home/           # 홈 화면 관련 컴포넌트
├── auth/           # 인증 관련 컴포넌트
└── pet/            # 반려동물 관련 컴포넌트
```

## 사용 방법

### 카테고리별 import (권장)

```tsx
import { Button, Input } from '../../components/common';
import { SearchBar, FilterButtons } from '../../components/home';
import { AuthTitle, ProgressBar } from '../../components/auth';
import { ImagePicker, DateInput } from '../../components/pet';
```

### 개별 컴포넌트 import

```tsx
import Button from '../../components/common/Button';
import SearchBar from '../../components/home/SearchBar';
import AuthTitle from '../../components/auth/AuthTitle';
import ImagePicker from '../../components/pet/ImagePicker';
```

## Common Components

### Button
재사용 가능한 버튼 컴포넌트

```tsx
<Button
  title="로그인"
  onPress={handleLogin}
  variant="primary"  // primary | secondary | outline
  size="large"       // small | medium | large
  loading={loading}
  disabled={disabled}
/>
```

### Input
일반 입력 필드 컴포넌트

```tsx
<Input
  label="이메일"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  placeholder="이메일을 입력하세요"
/>
```

### PasswordInput
비밀번호 입력 필드 컴포넌트 (비밀번호 표시/숨김 기능 포함)

```tsx
<PasswordInput
  label="비밀번호"
  value={password}
  onChangeText={setPassword}
  error={passwordError}
  placeholder="비밀번호를 입력하세요"
/>
```

### Header
공통 헤더 컴포넌트

```tsx
<Header
  title="Anipharm"
  onBack={handleBack}
  backgroundColor="#FF8A3D"
  titleColor="#fff"
  rightComponent={<TouchableOpacity><Icon name="settings" /></TouchableOpacity>}
/>
```

## Home Components

### SearchBar
검색 바 컴포넌트

```tsx
<SearchBar
  value={searchQuery}
  onChangeText={setSearchQuery}
  onSubmit={handleSearch}
  placeholder="장소명 또는 키워드를 검색하세요"
/>
```

### FilterButtons
카테고리 필터 버튼 컴포넌트

```tsx
<FilterButtons
  selectedCategory={selectedCategory}
  onCategoryChange={handleCategoryChange}
/>
```

### ViewModeToggle
지도/리스트 뷰 모드 토글 컴포넌트

```tsx
<ViewModeToggle
  mode={mapViewMode}
  onModeChange={setMapViewMode}
/>
```

### PlaceInfoCard
장소 정보 카드 컴포넌트

```tsx
<PlaceInfoCard
  hospital={selectedHospital}
  pharmacy={selectedPharmacy}
  place={selectedPlace}
  onMapPress={openNaverMap}
  onReservePress={handleReserve}
/>
```

### BottomNavigation
하단 네비게이션 바 컴포넌트

```tsx
<BottomNavigation
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

## Auth Components

### AuthTitle
인증 화면 타이틀 컴포넌트

```tsx
<AuthTitle subtitle="오신 것을 환영해요!" />
```

### SocialLoginButtons
SNS 로그인 버튼 컴포넌트

```tsx
<SocialLoginButtons
  onGooglePress={handleGoogleLogin}
  onKakaoPress={handleKakaoLogin}
  onApplePress={handleAppleLogin}
/>
```

### LinkButtons
링크 버튼들 컴포넌트 (아이디/비밀번호 찾기, 회원가입)

```tsx
<LinkButtons
  onFindIdPress={handleFindId}
  onFindPasswordPress={handleFindPassword}
  onSignUpPress={handleSignUp}
/>
```

### ProgressBar
진행률 표시 바 컴포넌트

```tsx
<ProgressBar progress={75} />
```

## Pet Components

### ImagePicker
이미지 선택 컴포넌트

```tsx
<ImagePicker
  imageUri={profileImage}
  onPress={handleImagePicker}
/>
```

### DateInput
날짜 입력 컴포넌트 (웹/네이티브 통합)

```tsx
<DateInput
  label="생년월일"
  value={birthDate}
  onChange={setBirthDate}
  error={birthDateError}
  placeholder="YYYY-MM-DD"
/>
```

### SpeciesSelector
반려동물 종 선택 컴포넌트

```tsx
<SpeciesSelector
  label="종류"
  value={species}
  onChange={setSpecies}
/>
```

### HealthConcernSelector
건강 고민 선택 컴포넌트

```tsx
<HealthConcernSelector
  label="건강고민(최대 5가지까지 가능)"
  values={healthConcerns}
  onChange={setHealthConcerns}
  maxSelection={5}
/>
```

## 스타일 가이드

### 색상
- Primary: `#FF8A3D`
- Background: `#FFF5EF`
- Text: `#333`
- Gray: `#666`, `#999`
- Error: `#FF4444`
- Success: `#4CAF50`

### 폰트 크기
- Small: 11-12px
- Regular: 14-16px
- Medium: 18px
- Large: 24px

### 간격
- Small: 8px
- Medium: 12-16px
- Large: 20-24px

### Border Radius
- Small: 8px
- Medium: 12px
- Large: 16-20px
