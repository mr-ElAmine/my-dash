import { useThemeColor } from "heroui-native";
import { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ChartConfig {
  animated?: boolean;
  duration?: number;
  gradient?: boolean;
}

type Props = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  config?: ChartConfig;
  style?: ViewStyle;
  showLabel?: boolean;
  label?: string;
  centerText?: string;
};

export const ProgressRingChart = ({
  progress,
  size = 120,
  strokeWidth = 8,
  config = {},
  style,
  showLabel = true,
  label,
  centerText,
}: Props) => {
  const { animated = true, duration = 1000, gradient = false } = config;
  const [accentColor, mutedColor] = useThemeColor(["accent", "muted"]);

  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = animated ? withTiming(1, { duration }) : 1;
  }, [progress, animated, duration]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const progressAnimatedProps = useAnimatedProps(() => {
    const animatedProgress = animationProgress.value * (progress / 100);
    const strokeDashoffset = circumference - animatedProgress * circumference;
    return { strokeDashoffset };
  });

  return (
    <View style={[{ alignItems: "center" }, style]}>
      {showLabel && label && (
        <SvgText
          x={center}
          y={20}
          textAnchor="middle"
          fontSize={14}
          fill={mutedColor}
          fontWeight="600"
        >
          {label}
        </SvgText>
      )}

      <Svg width={size} height={size}>
        <Defs>
          {gradient && (
            <LinearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <Stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={accentColor} stopOpacity="1" />
            </LinearGradient>
          )}
        </Defs>

        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={mutedColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.2}
        />

        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={gradient ? "url(#progressGradient)" : accentColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          transform={`rotate(-90 ${center} ${center})`}
          animatedProps={progressAnimatedProps}
        />

        {centerText ? (
          <SvgText
            x={center}
            y={center + 6}
            textAnchor="middle"
            fontSize={18}
            fill={accentColor}
            fontWeight="bold"
          >
            {centerText}
          </SvgText>
        ) : (
          <SvgText
            x={center}
            y={center + 6}
            textAnchor="middle"
            fontSize={16}
            fill={accentColor}
            fontWeight="600"
          >
            {Math.round(progress)}%
          </SvgText>
        )}
      </Svg>
    </View>
  );
};
