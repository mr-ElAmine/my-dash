import { useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

interface ChartConfig {
  width?: number;
  height?: number;
  padding?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
  gradient?: boolean;
  interactive?: boolean;
  showYLabels?: boolean;
  yLabelCount?: number;
  yAxisWidth?: number;
}

export type ChartDataPoint = {
  x: string | number;
  y: number;
  label?: string;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const createPath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return "";
  let path = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    path += ` Q${cpx},${prev.y} ${curr.x},${curr.y}`;
  }
  return path;
};

const createAreaPath = (
  points: { x: number; y: number }[],
  height: number
): string => {
  if (points.length === 0) return "";
  const last = points[points.length - 1];
  const first = points[0];
  return createPath(points) + ` L${last.x},${height} L${first.x},${height} Z`;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toFixed(0);
};

type Props = {
  data: ChartDataPoint[];
  config?: ChartConfig;
  style?: ViewStyle;
};

export const LineChart = ({ data, config = {}, style }: Props) => {
  const [containerWidth, setContainerWidth] = useState(300);
  const {
    height = 200,
    padding = 20,
    showGrid = true,
    showLabels = true,
    animated = true,
    duration = 1000,
    gradient = false,
    interactive = false,
    showYLabels = true,
    yLabelCount = 5,
    yAxisWidth = 20,
  } = config;

  const chartWidth = containerWidth || config.width || 300;
  const [accentColor, mutedColor] = useThemeColor(["accent", "muted"]);

  const animationProgress = useSharedValue(0);
  const touchX = useSharedValue(0);
  const showTooltip = useSharedValue(false);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: w } = event.nativeEvent.layout;
    if (w > 0) setContainerWidth(w);
  };

  useEffect(() => {
    animationProgress.value = animated
      ? withTiming(1, { duration })
      : 1;
  }, [data, animated, duration]);

  if (!data.length) return null;

  const maxValue = Math.max(...data.map((d) => d.y));
  const minValue = Math.min(...data.map((d) => d.y));
  const valueRange = maxValue - minValue || 1;

  const leftPadding = showYLabels ? padding + yAxisWidth : padding;
  const innerChartWidth = chartWidth - leftPadding - padding;
  const chartHeight = height - padding * 2;

  const points = data.map((point, index) => ({
    x: leftPadding + (index / (data.length - 1)) * innerChartWidth,
    y: padding + ((maxValue - point.y) / valueRange) * chartHeight,
  }));

  const pathData = createPath(points);
  const areaPathData = gradient ? createAreaPath(points, height - padding) : "";

  const yAxisLabels = [];
  if (showYLabels) {
    for (let i = 0; i < yLabelCount; i++) {
      const ratio = i / (yLabelCount - 1);
      yAxisLabels.push({
        value: maxValue - ratio * valueRange,
        y: padding + ratio * chartHeight,
      });
    }
  }

  const lineAnimatedProps = useAnimatedProps(() => ({
    strokeDasharray: animated
      ? `${animationProgress.value * 1000} 1000`
      : undefined,
  }));

  const areaAnimatedProps = useAnimatedProps(() => ({
    strokeDasharray: animated
      ? `${animationProgress.value * 1000} 1000`
      : undefined,
  }));

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      if (interactive) {
        touchX.value = event.x;
        showTooltip.value = true;
      }
    })
    .onUpdate((event) => {
      if (interactive) touchX.value = event.x;
    })
    .onEnd(() => {
      if (interactive) showTooltip.value = false;
    });

  return (
    <View style={[{ width: "100%", height }, style]} onLayout={handleLayout}>
      <GestureDetector gesture={panGesture}>
        <Animated.View>
          <Svg width={chartWidth} height={height}>
            <Defs>
              {gradient && (
                <LinearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
                  <Stop
                    offset="100%"
                    stopColor={accentColor}
                    stopOpacity="0.05"
                  />
                </LinearGradient>
              )}
            </Defs>

            {showYLabels && (
              <G>
                {yAxisLabels.map((label, index) => (
                  <SvgText
                    key={`yl-${index}`}
                    x={leftPadding - 10}
                    y={label.y + 4}
                    textAnchor="end"
                    fontSize={10}
                    fill={mutedColor}
                  >
                    {formatNumber(label.value)}
                  </SvgText>
                ))}
              </G>
            )}

            {showGrid && (
              <G>
                {yAxisLabels.map((label, index) => (
                  <Line
                    key={`gh-${index}`}
                    x1={leftPadding}
                    y1={label.y}
                    x2={chartWidth - padding}
                    y2={label.y}
                    stroke={mutedColor}
                    strokeWidth={0.5}
                    opacity={0.3}
                  />
                ))}
                {points.map((point, index) => (
                  <Line
                    key={`gv-${index}`}
                    x1={point.x}
                    y1={padding}
                    x2={point.x}
                    y2={height - padding}
                    stroke={mutedColor}
                    strokeWidth={0.5}
                    opacity={0.2}
                  />
                ))}
              </G>
            )}

            {gradient && (
              <AnimatedPath
                d={areaPathData}
                fill="url(#lineGradient)"
                animatedProps={areaAnimatedProps}
              />
            )}

            <AnimatedPath
              d={pathData}
              stroke={accentColor}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              animatedProps={lineAnimatedProps}
            />

            {points.map((point, index) => {
              const pointAnimatedProps = useAnimatedProps(() => ({
                opacity: animationProgress.value,
              }));
              return (
                <AnimatedCircle
                  key={`p-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={accentColor}
                  animatedProps={pointAnimatedProps}
                />
              );
            })}

            {showLabels && (
              <G>
                {data.map((point, index) => (
                  <SvgText
                    key={`xl-${index}`}
                    x={points[index].x}
                    y={height - 5}
                    textAnchor="middle"
                    fontSize={10}
                    fill={mutedColor}
                  >
                    {point.label || point.x.toString()}
                  </SvgText>
                ))}
              </G>
            )}
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
