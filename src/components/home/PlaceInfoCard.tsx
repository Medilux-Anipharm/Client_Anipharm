/**
 * PlaceInfoCard Component
 * 장소 정보 카드 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VeterinaryHospital } from '../../types/hospital';
import { VeterinaryPharmacy } from '../../types/pharmacy';
import { Place } from '../../types/map';

interface PlaceInfoCardProps {
  hospital?: VeterinaryHospital;
  pharmacy?: VeterinaryPharmacy;
  place?: Place;
  onMapPress: () => void;
  onReservePress: () => void;
}

const PlaceInfoCard: React.FC<PlaceInfoCardProps> = ({
  hospital,
  pharmacy,
  place,
  onMapPress,
  onReservePress,
}) => {
  if (!hospital && !pharmacy && !place) {
    return (
      <View style={styles.infoCard}>
        <View style={styles.emptyCard}>
          <Ionicons name="location-outline" size={40} color="#999" />
          <Text style={styles.emptyCardText}>검색 결과가 없습니다</Text>
        </View>
      </View>
    );
  }

  const renderPharmacyCard = () => {
    if (!pharmacy) return null;

    return (
      <>
        <View style={styles.infoCardHeader}>
          <Text style={styles.infoCardTitle} numberOfLines={1}>
            {pharmacy.name}
          </Text>
          {pharmacy.isLateNight && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>심야</Text>
            </View>
          )}
        </View>
        <Text style={styles.infoCardAddress} numberOfLines={1}>
          {pharmacy.address}
        </Text>
        {pharmacy.phone && (
          <View style={styles.infoCardDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{pharmacy.phone}</Text>
            </View>
          </View>
        )}
        {pharmacy.distance !== undefined && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              거리: {pharmacy.distance.toFixed(2)}km
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderHospitalCard = () => {
    if (!hospital) return null;

    return (
      <>
        <View style={styles.infoCardHeader}>
          <Text style={styles.infoCardTitle} numberOfLines={1}>
            {hospital.name}
          </Text>
          <View style={styles.statusBadge}>
            {hospital.is24h && (
              <Text style={styles.statusText}>24시간</Text>
            )}
            {hospital.isEmergency && (
              <Text style={[styles.statusText, { color: '#F44336' }]}>응급</Text>
            )}
          </View>
        </View>
        <Text style={styles.infoCardAddress} numberOfLines={1}>
          {hospital.address}
        </Text>
        {hospital.phone && (
          <View style={styles.infoCardDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{hospital.phone}</Text>
            </View>
          </View>
        )}
        {hospital.distance !== undefined && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              거리: {hospital.distance.toFixed(2)}km
            </Text>
            {hospital.ratingAverage > 0 && (
              <Text style={styles.distanceText}>
                평점: {hospital.ratingAverage.toFixed(1)} ({hospital.reviewCount}개 리뷰)
              </Text>
            )}
          </View>
        )}
      </>
    );
  };

  const renderPlaceCard = () => {
    if (!place) return null;

    return (
      <>
        <View style={styles.infoCardHeader}>
          <Text style={styles.infoCardTitle} numberOfLines={1}>
            {place.name}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>정보</Text>
          </View>
        </View>
        <Text style={styles.infoCardAddress} numberOfLines={1}>
          {place.roadAddress || place.address}
        </Text>
        {place.telephone && (
          <View style={styles.infoCardDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{place.telephone}</Text>
            </View>
          </View>
        )}
        {place.category && (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>{place.category}</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.infoCard}>
      {pharmacy && renderPharmacyCard()}
      {hospital && renderHospitalCard()}
      {place && renderPlaceCard()}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onMapPress}
        >
          <Ionicons name="map-outline" size={18} color="#FF8A3D" />
          <Text style={styles.actionButtonText}>지도에서 보기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reserveButton} onPress={onReservePress}>
          <Text style={styles.reserveButtonText}>예약하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  infoCardAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoCardDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  categoryContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  distanceContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5EF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8A3D',
  },
  reserveButton: {
    flex: 1,
    backgroundColor: '#FF8A3D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyCardText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default PlaceInfoCard;
