import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { G, Path, Circle } from "react-native-svg";

interface SectionData {
  title: string;
  color: string;
  totalScore: number;
  completedScore: number;
}

interface DonutChartProps {
  data: SectionData[];
  width: number;
  height: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, width, height }) => {
  const radius = Math.min(width, height) / 2;
  const centerX = width / 2;
  const centerY = height / 2;

  const totalScore = data.reduce((sum, section) => sum + section.totalScore, 0);
  let startAngle = -Math.PI / 2; // Start at the top (12 o'clock position)

  const createArc = (startAngle: number, endAngle: number): string => {
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Circle cx={centerX} cy={centerY} r={radius} fill="#121212" />
        {data.map((section, index) => {
          const sectionAngle = (2 * Math.PI * section.totalScore) / totalScore;
          const endAngle = startAngle + sectionAngle;
          const completedAngle =
            startAngle +
            (sectionAngle * section.completedScore) / section.totalScore;

          const totalPath = createArc(startAngle, endAngle);
          const completedPath = createArc(startAngle, completedAngle);

          startAngle = endAngle;

          return (
            <G key={index}>
              <Path d={totalPath} fill={section.color} opacity={0.2} />
              <Path d={completedPath} fill={section.color} />
            </G>
          );
        })}
        <Circle cx={centerX} cy={centerY} r={radius * 0.6} fill="#121212" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DonutChart;
