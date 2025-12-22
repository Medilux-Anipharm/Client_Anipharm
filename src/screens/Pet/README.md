# 반려동물 프로필 관리 화면

반려동물 프로필을 관리하는 화면들입니다.

## 구현된 화면

### 1. PetListScreen - 반려동물 목록 화면
- 여러 반려동물 프로필을 카드 형태로 표시
- 대표 반려동물 표시 (별 아이콘)
- 반려동물 전환 (카드 클릭 시 상세 화면으로 이동)
- 대표 반려동물 설정 기능
- 삭제 기능 (삭제 확인 다이얼로그 포함)
- 새로고침 기능 (Pull to Refresh)
- 빈 상태 처리 (반려동물이 없을 때)

**사용 예시:**
```tsx
import PetListScreen from './src/screens/Pet/PetListScreen';

<PetListScreen
  onNavigateBack={() => {/* 뒤로가기 처리 */}}
  onNavigateToDetail={(petId) => {/* 상세 화면으로 이동 */}}
  onNavigateToCreate={() => {/* 등록 화면으로 이동 */}}
/>
```

### 2. PetDetailScreen - 반려동물 상세/수정 화면
- 반려동물 상세 정보 표시
- 수정 모드 (편집 버튼 클릭 시)
- 프로필 이미지 표시
- 이름, 생년월일, 종류, 품종, 건강 고민 등 정보 표시
- 대표 반려동물 설정 기능
- 삭제 기능 (삭제 확인 다이얼로그 포함)
- 수정 취소 기능

**사용 예시:**
```tsx
import PetDetailScreen from './src/screens/Pet/PetDetailScreen';

<PetDetailScreen
  petId={1}
  onNavigateBack={() => {/* 뒤로가기 처리 */}}
  onNavigateToList={() => {/* 목록 화면으로 이동 */}}
/>
```

### 3. DeleteConfirmModal - 삭제 확인 다이얼로그
- 재사용 가능한 삭제 확인 모달 컴포넌트
- 커스터마이징 가능한 제목, 메시지, 버튼 텍스트

**사용 예시:**
```tsx
import DeleteConfirmModal from './src/components/common/DeleteConfirmModal';

<DeleteConfirmModal
  visible={deleteModalVisible}
  title="반려동물 삭제"
  message="정말로 이 반려동물을 삭제하시겠습니까?"
  onConfirm={handleDelete}
  onCancel={() => setDeleteModalVisible(false)}
  confirmText="삭제"
  cancelText="취소"
/>
```

## 주요 기능

### 1. 반려동물 목록 조회
- `GET /api/pets` - 사용자의 모든 반려동물 목록 조회
- 대표 반려동물(`isPrimary`) 표시
- `displayOrder` 기준 정렬

### 2. 반려동물 상세 조회
- `GET /api/pets/:petId` - 특정 반려동물 상세 정보 조회

### 3. 반려동물 정보 수정
- `PUT /api/pets/:petId` - 반려동물 정보 수정
- 수정 가능한 필드:
  - 이름, 생년월일, 종류, 품종, 성별, 체중
  - 프로필 이미지 URL
  - 건강 고민 (최대 5개)

### 4. 대표 반려동물 설정
- `PATCH /api/pets/:petId/primary` - 대표 반려동물 설정
- 다른 반려동물의 대표 설정은 자동으로 해제됨

### 5. 반려동물 삭제
- `DELETE /api/pets/:petId` - 반려동물 삭제 (Soft Delete)
- 삭제 확인 다이얼로그 표시
- 대표 반려동물 삭제 시 자동으로 다른 반려동물을 대표로 설정

## 디자인 특징

- 기존 `PetProfileCreationScreen`과 일관된 디자인
- 주 색상: `#FF8A3D` (오렌지)
- 배경 색상: `#FFF5EF` (연한 오렌지)
- 둥근 모서리: `borderRadius: 12px`
- 깔끔한 카드 디자인
- 반응형 레이아웃

## 통합 방법

### App.tsx에 통합 예시

```tsx
import React, { useState } from 'react';
import PetListScreen from './src/screens/Pet/PetListScreen';
import PetDetailScreen from './src/screens/Pet/PetDetailScreen';
import PetProfileCreationScreen from './src/screens/Pet/PetProfileCreationScreen';

type Screen = 'petList' | 'petDetail' | 'petCreate';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('petList');
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  if (currentScreen === 'petList') {
    return (
      <PetListScreen
        onNavigateBack={() => {/* 홈으로 이동 */}}
        onNavigateToDetail={(petId) => {
          setSelectedPetId(petId);
          setCurrentScreen('petDetail');
        }}
        onNavigateToCreate={() => {
          setCurrentScreen('petCreate');
        }}
      />
    );
  }

  if (currentScreen === 'petDetail' && selectedPetId) {
    return (
      <PetDetailScreen
        petId={selectedPetId}
        onNavigateBack={() => setCurrentScreen('petList')}
        onNavigateToList={() => setCurrentScreen('petList')}
      />
    );
  }

  // ... 다른 화면들
}
```

## 주의사항

1. **이미지 업로드**: 현재는 이미지 URL만 받아서 저장하는 방식입니다. 실제 이미지 업로드 기능은 별도로 구현해야 합니다.

2. **에러 처리**: 네트워크 오류나 서버 오류 시 Alert로 사용자에게 알립니다.

3. **로딩 상태**: 데이터 조회 및 저장 중에는 로딩 인디케이터를 표시합니다.

4. **유효성 검사**: 이름, 생년월일 등 필수 필드에 대한 유효성 검사를 수행합니다.

