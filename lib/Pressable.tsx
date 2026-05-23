import React, { useState } from "react";
import { Pressable as RNPressable, PressableProps, StyleProp, ViewStyle } from "react-native";

export interface CustomPressableProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
}

export const Pressable = React.forwardRef<any, CustomPressableProps>(
  ({ style, onPressIn, onPressOut, children, ...props }, ref) => {
    const [pressed, setPressed] = useState(false);

    // Resolve the style manually if it is a function callback
    const resolvedStyle = typeof style === "function" ? style({ pressed }) : style;

    return (
      <RNPressable
        ref={ref}
        onPressIn={(e) => {
          setPressed(true);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          setPressed(false);
          onPressOut?.(e);
        }}
        style={resolvedStyle}
        {...props}
      >
        {typeof children === "function"
          ? (children as Function)({ pressed })
          : children}
      </RNPressable>
    );
  }
);
