import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PickupStatusScreenProps {
  onClose: () => void;
}

const PickupStatusScreen: React.FC<PickupStatusScreenProps> = ({ onClose }) => {
  // 더미 픽업 요청 데이터
  const dummyPickupRequest = {
    id: 'REQ-2024-001',
    status: 'pending', // pending, ready, completed
    requestDate: '2024-01-06 13:30',
    pharmacy: {
      name: '우리동물약국 강남점',
      phone: '02-1234-5678',
      address: '서울시 강남구 테헤란로 123',
    },
    products: [
      { name: '베토큐어 워머', quantity: 2 },
      { name: '펫닥 프로바이오틱스', quantity: 1 },
      { name: '덴티펫 구강 케어', quantity: 1 },
    ],
    estimatedPickupDate: '2024-01-09 (화)',
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: 'time-outline' as const,
          color: '#FF9800',
          text: '픽업 준비 중',
          description: '약국에서 픽업을 준비하고 있습니다.',
        };
      case 'ready':
        return {
          icon: 'checkmark-circle-outline' as const,
          color: '#4CAF50',
          text: '픽업 준비 완료',
          description: '약국에서 픽업 대기 중입니다.',
        };
      case 'completed':
        return {
          icon: 'checkbox-outline' as const,
          color: '#2196F3',
          text: '픽업 완료',
          description: '픽업이 완료되었습니다.',
        };
      default:
        return {
          icon: 'help-circle-outline' as const,
          color: '#999',
          text: '상태 확인 중',
          description: '',
        };
    }
  };

  const statusInfo = getStatusInfo(dummyPickupRequest.status);

  // PICK-16: 단계형 상태 표시
  const getStepStatus = (step: number) => {
    const currentStep =
      dummyPickupRequest.status === 'pending' ? 1 :
      dummyPickupRequest.status === 'ready' ? 2 :
      dummyPickupRequest.status === 'completed' ? 3 : 0;

    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>픽업 상태</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* 픽업 요청 완료 메시지 */}
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>픽업 요청이 완료되었습니다!</Text>
          <Text style={styles.successSubtitle}>
            요청번호: {dummyPickupRequest.id}
          </Text>
        </View>

        {/* PICK-16: 단계형 상태 표시 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>진행 상태</Text>
          <View style={styles.progressCard}>
            {/* Step 1: 요청 접수 */}
            <View style={styles.progressStep}>
              <View style={styles.stepIndicator}>
                <View style={[
                  styles.stepCircle,
                  getStepStatus(1) === 'completed' && styles.stepCircleCompleted,
                  getStepStatus(1) === 'current' && styles.stepCircleCurrent,
                ]}>
                  {getStepStatus(1) === 'completed' ? (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  ) : (
                    <Text style={[
                      styles.stepNumber,
                      getStepStatus(1) === 'current' && styles.stepNumberCurrent
                    ]}>1</Text>
                  )}
                </View>
                <View style={[
                  styles.stepLine,
                  (getStepStatus(1) === 'completed' || getStepStatus(2) === 'current' || getStepStatus(2) === 'completed') && styles.stepLineCompleted
                ]} />
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepTitle,
                  getStepStatus(1) === 'current' && styles.stepTitleCurrent
                ]}>요청 접수</Text>
                <Text style={styles.stepDescription}>픽업 요청이 접수되었습니다</Text>
              </View>
            </View>

            {/* Step 2: 픽업 준비 */}
            <View style={styles.progressStep}>
              <View style={styles.stepIndicator}>
                <View style={[
                  styles.stepCircle,
                  getStepStatus(2) === 'completed' && styles.stepCircleCompleted,
                  getStepStatus(2) === 'current' && styles.stepCircleCurrent,
                ]}>
                  {getStepStatus(2) === 'completed' ? (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  ) : (
                    <Text style={[
                      styles.stepNumber,
                      getStepStatus(2) === 'current' && styles.stepNumberCurrent
                    ]}>2</Text>
                  )}
                </View>
                <View style={[
                  styles.stepLine,
                  (getStepStatus(2) === 'completed' || getStepStatus(3) === 'current' || getStepStatus(3) === 'completed') && styles.stepLineCompleted
                ]} />
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepTitle,
                  getStepStatus(2) === 'current' && styles.stepTitleCurrent
                ]}>픽업 준비 완료</Text>
                <Text style={styles.stepDescription}>약품 준비가 완료되었습니다</Text>
              </View>
            </View>

            {/* Step 3: 픽업 완료 */}
            <View style={[styles.progressStep, styles.progressStepLast]}>
              <View style={styles.stepIndicator}>
                <View style={[
                  styles.stepCircle,
                  getStepStatus(3) === 'completed' && styles.stepCircleCompleted,
                  getStepStatus(3) === 'current' && styles.stepCircleCurrent,
                ]}>
                  {getStepStatus(3) === 'completed' ? (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  ) : (
                    <Text style={[
                      styles.stepNumber,
                      getStepStatus(3) === 'current' && styles.stepNumberCurrent
                    ]}>3</Text>
                  )}
                </View>
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepTitle,
                  getStepStatus(3) === 'current' && styles.stepTitleCurrent
                ]}>픽업 완료</Text>
                <Text style={styles.stepDescription}>약품을 수령했습니다</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 현재 상태 요약 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>현재 상태</Text>
          <View style={styles.statusCard}>
            <Ionicons name={statusInfo.icon} size={32} color={statusInfo.color} />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
              <Text style={styles.statusDescription}>{statusInfo.description}</Text>
            </View>
          </View>
        </View>

        {/* 예상 픽업 일자 */}
        {dummyPickupRequest.status === 'pending' && (
          <View style={styles.estimateCard}>
            <Ionicons name="calendar-outline" size={20} color="#2196F3" />
            <Text style={styles.estimateText}>
              예상 픽업 일자: {dummyPickupRequest.estimatedPickupDate}
            </Text>
          </View>
        )}

        {/* 약국 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>픽업 약국</Text>
          <View style={styles.card}>
            <Text style={styles.pharmacyName}>{dummyPickupRequest.pharmacy.name}</Text>
            <View style={styles.pharmacyDetail}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.pharmacyDetailText}>
                {dummyPickupRequest.pharmacy.address}
              </Text>
            </View>
            <View style={styles.pharmacyDetail}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.pharmacyDetailText}>
                {dummyPickupRequest.pharmacy.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* 요청한 약품 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>요청한 약품</Text>
          <View style={styles.card}>
            {dummyPickupRequest.products.map((product, index) => (
              <View key={index}>
                <View style={styles.productItem}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productQuantity}>{product.quantity}개</Text>
                </View>
                {index < dummyPickupRequest.products.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 요청 일시 */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>요청 일시</Text>
          <Text style={styles.infoValue}>{dummyPickupRequest.requestDate}</Text>
        </View>

        {/* PICK-17: 상태 변경 알림 안내 */}
        <View style={styles.infoBox}>
          <Ionicons name="notifications-outline" size={20} color="#FF8A3D" />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: '#FF8A3D' }]}>알림 안내</Text>
            <Text style={[styles.infoText, { color: '#666' }]}>
              • 픽업 상태가 변경되면 푸시 알림을 보내드립니다{'\n'}
              • 픽업 준비 완료 시 즉시 알림을 받으실 수 있습니다{'\n'}
              • 알림 설정은 앱 설정에서 변경 가능합니다
            </Text>
          </View>
        </View>

        {/* 안내 사항 */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>안내 사항</Text>
            <Text style={styles.infoText}>
              • 재고가 없는 약품은 발주 후 픽업이 가능합니다{'\n'}
              • 픽업 예정일은 변경될 수 있습니다{'\n'}
              • 문의 사항은 약국으로 직접 연락해주세요
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callButton} onPress={() => {}}>
          <Ionicons name="call" size={20} color="#FF8A3D" />
          <Text style={styles.callButtonText}>약국에 전화하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={onClose}>
          <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerSpacer: {
    width: 32,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 140,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  progressStepLast: {
    marginBottom: 0,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCurrent: {
    backgroundColor: '#FF8A3D',
  },
  stepCircleCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
  },
  stepNumberCurrent: {
    color: '#FFF',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
    minHeight: 40,
  },
  stepLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  stepTitleCurrent: {
    color: '#FF8A3D',
    fontWeight: '700',
  },
  stepDescription: {
    fontSize: 13,
    color: '#999',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
  },
  estimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  estimateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pharmacyName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  pharmacyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pharmacyDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  productName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  productQuantity: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF8A3D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF5ED',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FF8A3D',
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF8A3D',
    marginLeft: 8,
  },
  homeButton: {
    backgroundColor: '#FF8A3D',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default PickupStatusScreen;
