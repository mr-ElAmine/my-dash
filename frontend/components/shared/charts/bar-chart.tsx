import { useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { G, Rect, Text as SvgText } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface ChartConfig {
  width?: number;
  height?: number;
  padding?: number;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

type Props = {
  data: ChartDataPoint[];
  config?: ChartConfig;
  style?: ViewStyle;
};

type AnimatedBarProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  chartHeight: number;
  bottomPadding: number;
  animationProgress: { value: number };
};

function AnimatedBar({
  x,
  y,
  width,
  height,
  fill,
  chartHeight,
  bottomPadding,
  animationProgress,
}: AnimatedBarProps) {
  const animatedProps = useAnimatedProps(() => ({
    height: animationProgress.value * height,
    y: chartHeight - bottomPadding - animationProgress.value * height,
  }));

  return (
    <AnimatedRect
      x={x}
      y={y}
      width={width}
      fill={fill}
      rx={4}
      animatedProps={animatedProps}
    />
  );
}

export const BarChart = ({ data, config = {}, style }: Props) => {
  const [containerWidth, setContainerWidth] = useState(300);
  const {
    height = 200,
    padding = 20,
    showLabels = true,
    animated = true,
    duration = 800,
  } = config;

  const chartWidth = containerWidth || config.width || 300;
  const [accentColor, mutedColor] = useThemeColor(["accent", "muted"]);

  const animationProgress = useSharedValue(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: w } = event.nativeEvent.layout;
    if (w > 0) setContainerWidth(w);
  };

  useEffect(() => {
    animationProgress.value = animated ? withTiming(1, { duration }) : 1;
  }, [data, animated, duration, animationProgress]);

  if (!data.length) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const innerChartWidth = chartWidth - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = (innerChartWidth / data.length) * 0.8;
  const barSpacing = (innerChartWidth / data.length) * 0.2;

  return (
    <View style={[{ width: "100%", height }, style]} onLayout={handleLayout}>
      <Svg width={chartWidth} height={height}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = height - padding - barHeight;

          return (
            <G key={`bar-${index}`}>
              <AnimatedBar
                x={x}
                y={y}
                width={barWidth}
                fill={item.color || accentColor}
                height={barHeight}
                chartHeight={height}
                bottomPadding={padding}
                animationProgress={animationProgress}
              />
              {showLabels && (
                <>
                  <SvgText
                    x={x + barWidth / 2}
                    y={height - 5}
                    textAnchor="middle"
                    fontSize={12}
                    fill={mutedColor}
                  >
                    {item.label}
                  </SvgText>
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize={11}
                    fill={mutedColor}
                    fontWeight="600"
                  >
                    {item.value}
                  </SvgText>
                </>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
};
