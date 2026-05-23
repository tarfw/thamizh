import React from "react";
import { View, ViewStyle } from "react-native";

type Props = {
  size?: number;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
};

export default function BrandLogo({
  size = 48,
  color = "#1A73E8",
  thickness,
  style,
}: Props) {
  const t = thickness ?? Math.max(3, size * 0.12);
  const spokeLength = size / 2;
  const hubSize = t * 1.5;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        },
        style,
      ]}
    >
      {/* Spokes */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = i * 72;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              width: t,
              height: size,
              justifyContent: "flex-start",
              alignItems: "center",
              transform: [{ rotate: `${angle}deg` }],
            }}
          >
            <View
              style={{
                width: t,
                height: spokeLength,
                backgroundColor: color,
                borderRadius: t / 2,
              }}
            />
          </View>
        );
      })}

      {/* Center Hub */}
      <View
        style={{
          position: "absolute",
          width: hubSize,
          height: hubSize,
          borderRadius: hubSize / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
