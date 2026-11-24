import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, spacing } from '@/theme';

const QUICK_ACTION_COUNT = 4;

/** Grey blocks shaped like the Home cards, shown on first load. */
export function HomeSkeleton() {
  return (
    <View style={styles.wrap} testID="home-skeleton">
      <Skeleton height={68} radius={radius.lg} />
      <View style={styles.row}>
        {Array.from({ length: QUICK_ACTION_COUNT }, (_, i) => (
          <Skeleton key={i} height={68} radius={radius.lg} style={styles.flex} />
        ))}
      </View>
      <Card style={styles.card}>
        <Skeleton width="40%" height={14} />
        <Skeleton width="60%" height={30} />
        <Skeleton height={5} />
        <Skeleton width="50%" height={12} />
      </Card>
      <Card style={[styles.card, styles.section]}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} />
        <Skeleton height={160} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xs,
    gap: 10,
    backgroundColor: colors.page,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  card: { padding: spacing.lg, gap: spacing.md },
  section: { flex: 1 },
});
