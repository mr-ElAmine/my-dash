import { useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, ViewStyle } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface ChartConfig {
  width?: number;
  height?: number;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
  innerRadius?: number;
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

export const DoughnutChart = ({ data, config = {}, style }: Props) => {
  const [containerWidth, setContainerWidth] = useState(300);
  const {
    height = 200,
    showLabels = true,
    animated = true,
    duration = 1000,
    innerRadius = 0.5,
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
  }, [data, animated, duration]);

  if (!data.length) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const outerRadius = Math.min(chartWidth, height) / 2 - 20;
  const innerRadiusValue = outerRadius * innerRadius;
  const centerX = chartWidth / 2;
  const centerY = height / 2;

  let currentAngle = -Math.PI / 2;

  const colors = [
    accentColor,
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <View style={[{ width: "100%" }, style]} onLayout={handleLayout}>
      <Svg width={chartWidth} height={height}>
        {data.map((item, index) => {
          const sliceAngle = (item.value / total) * 2 * Math.PI;
          const startAngle = currentAngle;
          const endAngle = currentAngle + sliceAngle;
          const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

          const x1 = centerX + outerRadius * Math.cos(startAngle);
          const y1 = centerY + outerRadius * Math.sin(startAngle);
          const x2 = centerX + outerRadius * Math.cos(endAngle);
          const y2 = centerY + outerRadius * Math.sin(endAngle);
          const x3 = centerX + innerRadiusValue * Math.cos(endAngle);
          const y3 = centerY + innerRadiusValue * Math.sin(endAngle);
          const x4 = centerX + innerRadiusValue * Math.cos(startAngle);
          const y4 = centerY + innerRadiusValue * Math.sin(startAngle);

          const pathData = [
            `M ${x1} ${y1}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerRadiusValue} ${innerRadiusValue} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
            "Z",
          ].join(" ");

          const labelAngle = startAngle + sliceAngle / 2;
          const labelRadius = (outerRadius + innerRadiusValue) / 2;
          const labelX = centerX + labelRadius * Math.cos(labelAngle);
          const labelY = centerY + labelRadius * Math.sin(labelAngle);

          currentAngle = endAngle;

          const sliceAnimatedProps = useAnimatedProps(() => ({
            opacity: animationProgress.value,
          }));

          return (
            <G key={`slice-${index}`}>
              <AnimatedPath
                d={pathData}
                fill={item.color || colors[index % colors.length]}
                animatedProps={sliceAnimatedProps}
              />
              {showLabels && (
                <SvgText
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#FFFFFF"
                  fontWeight="600"
                  alignmentBaseline="middle"
                >
                  {Math.round((item.value / total) * 100)}%
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>

      <View style={{ marginTop: 10, gap: 4 }}>
        {data.map((item, index) => (
          <View
            key={`legend-${index}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: item.color || colors[index % colors.length],
                marginRight: 8,
              }}
            />
            <Text style={{ fontSize: 12, color: mutedColor }}>
              {item.label}: {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
