/**
 * ReviewSummary Component
 * 리뷰 요약 컴포넌트 (평점, 분포, 키워드)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReviewSummary as ReviewSummaryType } from '../../types/review';

interface ReviewSummaryProps {
  summary: ReviewSummaryType;
  onWriteReview?: () => void;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  summary,
  onWriteReview,
}) => {
  const renderStars = (rating: number | string) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;

    return Array.from({ length: 5 }, (_, index) => {
      if (index < fullStars) {
        return (
          <Ionicons
            key={index}
            name="star"
            size={20}
            color="#FFD700"
          />
        );
      } else if (index === fullStars && hasHalfStar) {
        return (
          <Ionicons
            key={index}
            name="star-half"
            size={20}
            color="#FFD700"
          />
        );
      } else {
        return (
          <Ionicons
            key={index}
            name="star-outline"
            size={20}
            color="#FFD700"
          />
        );
      }
    });
  };

  const getMaxRatingCount = () => {
    return Math.max(
      summary.ratingDistribution[5],
      summary.ratingDistribution[4],
      summary.ratingDistribution[3],
      summary.ratingDistribution[2],
      summary.ratingDistribution[1]
    );
  };

  const maxCount = getMaxRatingCount();

  const averageRatingNum = typeof summary.averageRating === 'string' 
    ? parseFloat(summary.averageRating) 
    : summary.averageRating;

  return (
    <View style={styles.container}>
      {/* 평점 헤더 */}
      <View style={styles.ratingHeader}>
        <View style={styles.ratingInfo}>
          <Text style={styles.ratingNumber}>
            {averageRatingNum.toFixed(1)}
          </Text>
          <View style={styles.starsContainer}>
            {renderStars(averageRatingNum)}
          </View>
          <Text style={styles.reviewCount}>
            {summary.totalReviews}개 리뷰
          </Text>
        </View>
      </View>

      {/* 평점 분포 */}
      <View style={styles.distributionContainer}>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution];
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <View key={rating} style={styles.distributionRow}>
              <Text style={styles.ratingLabel}>{rating}점</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: `${percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.ratingCount}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* 리뷰 작성 버튼 */}
      {onWriteReview && (
        <TouchableOpacity
          style={styles.writeButton}
          onPress={onWriteReview}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={18} color="#FF8A3D" />
          <Text style={styles.writeButtonText}>리뷰 작성하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  ratingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingInfo: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  distributionContainer: {
    marginBottom: 20,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    width: 30,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    width: 30,
    textAlign: 'right',
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5EF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  writeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8A3D',
  },
});

export default ReviewSummary;

