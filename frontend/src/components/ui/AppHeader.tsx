import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { routes } from '@/navigation/routes';
import { colors, fonts, fontSizes, spacing } from '@/theme';

type Props = { unreadCount?: number };

const BELL_SIZE = 44;
const BADGE_SIZE = 16;
const HEADER_PADDING = 9;

function BellBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.badge} testID="bell-badge">
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
}

/** Blue app header: "Event Flow By TCE" and the notifications bell. */
export function AppHeader({ unreadCount = 0 }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + HEADER_PADDING }]}>
      <Text style={styles.title} accessibilityRole="header">
        Event Flow<Text style={styles.accent}> By TCE</Text>
      </Text>
      <Pressable
        style={styles.bell}
        onPress={() => router.push(routes.notifications)}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Feather name="bell" size={20} color={colors.header.title} />
        <BellBadge count={unreadCount} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.header.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: HEADER_PADDING,
  },
  title: { fontFamily: fonts.bold, fontSize: fontSizes.xl, color: colors.header.title },
  accent: { color: colors.header.accent },
  bell: {
    width: BELL_SIZE,
    height: BELL_SIZE,
    borderRadius: BELL_SIZE / 2,
    backgroundColor: colors.header.bellCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    paddingHorizontal: 3,
    backgroundColor: colors.header.badge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 10, color: colors.white },
});
