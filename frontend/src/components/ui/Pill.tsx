import { StyleSheet, Text, View } from 'react-native';

import { fonts, fontSizes, radius, spacing } from '@/theme';

type Props = { label: string; background: string; color: string; testID?: string };

/** Rounded label with a leading dot, as on the Home cards. */
export function Pill({ label, background, color, testID }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: background }]} testID={testID}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const DOT_SIZE = 5;

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },
  label: { fontFamily: fonts.semibold, fontSize: fontSizes.sm },
});
