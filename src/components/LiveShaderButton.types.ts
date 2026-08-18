import React from "react";
import { StyleProp, ViewStyle } from "react-native";

export interface LiveShaderButtonIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export interface LiveShaderButtonProps {
  title: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress: () => void;
  icon: React.ComponentType<LiveShaderButtonIconProps>;
  trailingIcon?: React.ComponentType<LiveShaderButtonIconProps>;
  gradientColors: readonly [string, string];
  disabledColor: string;
  style?: StyleProp<ViewStyle>;
}
