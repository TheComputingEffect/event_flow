import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, fonts, fontSizes, radius, spacing } from '@/theme';

type Props = { message: string; onRetry?: () => void; testID?: string };

/** Full-card message for the error and not-signed-in states. */
export function HomeMessageCard({ message, onRetry, testID }: Props) {
  return (
    <View style={styles.wrap}>
      <Card style={styles.card} testID={testID}>
        <Text style={styles.message}>{message}</Text>
        {onRetry ? (
          <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button">
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.lg, paddingTop: spacing.xs, backgroundColor: colors.page },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  message: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg,
    color: colors.ink,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  buttonText: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.white },
});
