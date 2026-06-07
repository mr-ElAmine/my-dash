import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ViewStyle, TextStyle } from "react-native";
import PerformanceStats, { PerformanceStatsData } from "react-native-performance-stats";

export function PerfOverlay() {
  const [stats, setStats] = useState<PerformanceStatsData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!__DEV__) return;

    // Start tracking performance stats (with CPU tracking enabled)
    PerformanceStats.start(true);

    const subscription = PerformanceStats.addListener((data) => {
      setStats(data);
    });

    return () => {
      subscription.remove();
      PerformanceStats.stop();
    };
  }, []);

  if (!__DEV__ || !stats) return null;

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatCpu = (cpu: number) => {
    return `${cpu.toFixed(1)}%`;
  };

  if (!isExpanded) {
    return (
      <Pressable
        onPress={() => setIsExpanded(true)}
        style={styles.collapsedBadge}
        className="shadow-md"
      >
        <Text style={styles.badgeText}>
          ⚡ {stats.uiFps.toFixed(0)} / {stats.jsFps.toFixed(0)} FPS
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container} className="shadow-lg">
      <View style={styles.header}>
        <Text style={styles.title}>📈 MyDash Performance</Text>
        <Pressable onPress={() => setIsExpanded(false)} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✖</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>FPS UI:</Text>
        <Text style={[styles.value, stats.uiFps < 45 ? styles.valueWarning : styles.valueGood]}>
          {stats.uiFps.toFixed(0)} FPS
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>FPS JS:</Text>
        <Text style={[styles.value, stats.jsFps < 45 ? styles.valueWarning : styles.valueGood]}>
          {stats.jsFps.toFixed(0)} FPS
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Mémoire RAM:</Text>
        <Text style={styles.value}>{formatBytes(stats.usedRam)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Usage CPU:</Text>
        <Text style={styles.value}>{formatCpu(stats.usedCpu)}</Text>
      </View>
    </View>
  );
}

const styles = {
  collapsedBadge: {
    position: "absolute" as const,
    bottom: 24,
    right: 16,
    backgroundColor: "rgba(0, 40, 67, 0.95)", // COLOR_BG_DARK (Navy) with opacity
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 9999,
  } as ViewStyle,
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600" as const,
    fontFamily: "System",
  } as TextStyle,
  container: {
    position: "absolute" as const,
    bottom: 24,
    right: 16,
    backgroundColor: "rgba(0, 40, 67, 0.98)", // COLOR_BG_DARK (Navy) with high opacity
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
    width: 190,
    zIndex: 9999,
  } as ViewStyle,
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
    paddingBottom: 4,
  } as ViewStyle,
  title: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold" as const,
    flex: 1,
  } as TextStyle,
  closeBtn: {
    padding: 2,
  } as ViewStyle,
  closeBtnText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 10,
  } as TextStyle,
  row: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginVertical: 3,
  } as ViewStyle,
  label: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10.5,
  } as TextStyle,
  value: {
    color: "#fff",
    fontSize: 10.5,
    fontWeight: "600" as const,
  } as TextStyle,
  valueGood: {
    color: "#4ade80", // Light Green
  } as TextStyle,
  valueWarning: {
    color: "#f87171", // Rose/Red
  } as TextStyle,
};
