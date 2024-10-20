import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { G, Path, Circle } from "react-native-svg";
import { SectionData } from "../types";

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

          //only one section is loaded
          if (
            data.length === 1 &&
            section.completedScore === section.totalScore &&
            section.totalScore > 0
          ) {
            return (
              <Circle
                key={section.title}
                cx={centerX}
                cy={centerY}
                r={radius}
                fill={section.color}
              />
            );
          }

          // Calculate the angle for completed goals
          const completedAngle =
            startAngle +
            (sectionAngle * section.completedScore) / section.totalScore;

          // Paths for completed and remaining sections
          const completedPath = createArc(startAngle, completedAngle);
          const remainingPath = createArc(completedAngle, endAngle);

          // Move start angle for the next section
          startAngle = endAngle;

          return (
            <G key={section.title}>
              <Path d={remainingPath} fill={section.color} opacity={0.2} />
              <Path d={completedPath} fill={section.color} />
            </G>
          );
        })}
        <Circle cx={centerX} cy={centerY} r={radius * 0.8} fill="#2c2c2c" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
});

export default DonutChart;
