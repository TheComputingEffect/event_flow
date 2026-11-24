import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme';

import { AppHeader } from './AppHeader';

/** Placeholder for pages that Home links to but are not built yet. */
export function ComingSoon() {
  return (
    <View style={styles.screen}>
      <AppHeader />
      <Text style={styles.text}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  text: {
    padding: spacing.xl,
    fontFamily: fonts.medium,
    fontSize: fontSizes.lg,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
