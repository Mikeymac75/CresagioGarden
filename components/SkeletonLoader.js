import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

/**
 * A reusable skeleton loader component that shows a shimmering animation.
 * It can be used to build loading placeholders for various UI elements.
 */
const SkeletonPiece = ({ width, height, style }) => {
  const [actualWidth, setActualWidth] = React.useState(0);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // We only want to start the animation when we have a measured width
    if (actualWidth > 0) {
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [actualWidth, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    // Use the measured numeric width for the animation range, not the prop
    outputRange: [-actualWidth, actualWidth],
  });

  const handleLayout = (event) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    setActualWidth(measuredWidth);
  };

  return (
    <View
      style={[{ width, height, backgroundColor: '#E1E9EE', overflow: 'hidden' }, style]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [{ translateX }],
        }}
      >
        <View style={{ width: '100%', height: '100%', backgroundColor: '#F2F8FC', opacity: 0.5 }} />
      </Animated.View>
    </View>
  );
};

SkeletonPiece.propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    style: PropTypes.object,
};

/**
 * A skeleton loader specifically for the stats card on the HomeScreen.
 */
export const StatsCardSkeleton = () => (
  <View style={styles.statsCard}>
    <View style={styles.statItem}>
      <SkeletonPiece width={60} height={32} style={{ marginBottom: 8 }} />
      <SkeletonPiece width={100} height={16} />
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <SkeletonPiece width={40} height={32} style={{ marginBottom: 8 }} />
      <SkeletonPiece width={120} height={16} />
    </View>
  </View>
);

/**
 * A skeleton loader for a single task card in the task list.
 */
export const TaskCardSkeleton = () => (
  <View style={styles.taskCard}>
    <SkeletonPiece width={24} height={24} style={{ borderRadius: 4, marginRight: 15 }} />
    <View style={{ flex: 1 }}>
      <SkeletonPiece width={100} height={14} style={{ marginBottom: 8 }} />
      <SkeletonPiece width={'80%'} height={18} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  statsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -30,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 5,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, backgroundColor: '#ddd' },
  taskCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
