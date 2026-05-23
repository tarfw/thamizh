import { Text, View, ViewStyle } from "react-native";
import { avatarColor, initialsOf } from "./theme";

type Props = {
  name: string;
  size?: number;
  seed?: string;
  style?: ViewStyle;
};

export default function Avatar({ name, size = 40, seed, style }: Props) {
  const palette = avatarColor(seed ?? name);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.bg,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text
        style={{
          color: palette.fg,
          fontSize: Math.round(size * 0.42),
          fontWeight: "500",
          letterSpacing: 0.2,
        }}
      >
        {initialsOf(name)}
      </Text>
    </View>
  );
}
