import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme';

/** One-line empty message in the same row style as list rows. */
export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  text: { fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.textMuted },
});
