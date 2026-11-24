import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius as radii } from '@/theme';

type Props = {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** A grey placeholder block shown while data loads. */
export function Skeleton({ width = '100%', height, radius = radii.sm, style }: Props) {
  return (
    <View
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.skeleton }, style]}
    />
  );
}
