import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  LayoutAnimationConfig,
} from 'react-native-reanimated';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  type?: 'fade' | 'slide' | 'scale';
  style?: any;
}

export function AnimatedCard({
  children,
  delay = 0,
  type = 'fade',
  style,
}: AnimatedCardProps) {
  const entering =
    type === 'fade'
      ? FadeIn.delay(delay)
      : type === 'slide'
      ? SlideInRight.delay(delay)
      : FadeIn.delay(delay);

  const exiting =
    type === 'fade'
      ? FadeOut
      : type === 'slide'
      ? SlideOutLeft
      : FadeOut;

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={[styles.container, style]}
    >
      {children}
    </Animated.View>
  );
}

interface AnimatedListProps {
  children: React.ReactNode;
  style?: any;
}

export function AnimatedList({ children, style }: AnimatedListProps) {
  return (
    <LayoutAnimationConfig skipEntering>
      <Animated.View style={[styles.list, style]}>{children}</Animated.View>
    </LayoutAnimationConfig>
  );
}

interface AnimatedItemProps {
  children: React.ReactNode;
  index: number;
  style?: any;
}

export function AnimatedItem({ children, index, style }: AnimatedItemProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 50)}
      style={[styles.item, style]}
    >
      {children}
    </Animated.View>
  );
}

interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export function AnimatedButton({
  children,
  onPress,
  style,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.button, animatedStyle, style]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  width?: number;
}

export function AnimatedProgressBar({
  progress,
  color = '#2563eb',
  height = 8,
  width = 300,
}: ProgressBarProps) {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming((progress / 100) * width, { duration: 500 });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: progressWidth.value,
    };
  });

  return (
    <Animated.View style={[styles.progressContainer, { height, width }]}>
      <Animated.View
        style={[
          styles.progressFill,
          { backgroundColor: color, height },
          animatedStyle,
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  item: {
    marginBottom: 0,
  },
  button: {
    // Button styles
  },
  progressContainer: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 9999,
  },
});
