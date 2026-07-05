import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Path,
} from 'react-native-svg';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useId } from 'react';

interface LogoProps {
  size?: number;
  style?: ViewStyle;
}

export function Logo({ size = 80, style }: LogoProps) {
  const id = useId();
  const bgGradient = `${id}-bg`;
  const bridgeGradient = `${id}-bridge`;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 1024 1024" fill="none">
        <Defs>
          <LinearGradient id={bgGradient} x1="168" y1="124" x2="860" y2="900" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#14B8A6" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#2563EB" stopOpacity="0.12" />
          </LinearGradient>
          <LinearGradient id={bridgeGradient} x1="224" y1="220" x2="800" y2="772" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#14B8A6" />
            <Stop offset="1" stopColor="#2563EB" />
          </LinearGradient>
        </Defs>
        <Circle cx="512" cy="512" r="360" fill={`url(#${bgGradient})`} />
        <Path d="M238 575 C302 366 722 366 786 575" stroke={`url(#${bridgeGradient})`} strokeWidth="72" strokeLinecap="round" />
        <Path d="M236 694 H788" stroke={`url(#${bridgeGradient})`} strokeWidth="66" strokeLinecap="round" />
        <Path d="M324 575 V694" stroke="#2563EB" strokeWidth="52" strokeLinecap="round" />
        <Path d="M512 454 V694" stroke="#14B8A6" strokeWidth="52" strokeLinecap="round" />
        <Path d="M700 575 V694" stroke="#2563EB" strokeWidth="52" strokeLinecap="round" />
        <Path d="M260 394 H366 L414 318 L478 502 L536 374 L582 394 H742" stroke="#EF476F" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="742" cy="394" r="82" fill="#14B8A6" />
        <Path d="M742 350 V438" stroke="white" strokeWidth="28" strokeLinecap="round" />
        <Path d="M698 394 H786" stroke="white" strokeWidth="28" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
