import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconTile, type FeatherName } from '@/components/ui/IconTile';
import { routes } from '@/navigation/routes';
import { colors, fonts, fontSizes, radius, spacing } from '@/theme';

type Action = {
  label: string;
  href: string;
  icon: FeatherName | { glyph: string };
  tone: keyof typeof colors.quickAction;
};

const ACTIONS: readonly Action[] = [
  { label: 'Add event', href: routes.newEvent, icon: 'calendar', tone: 'event' },
  { label: 'New quote', href: routes.newQuotation, icon: 'file-text', tone: 'quote' },
  // Feather has no rupee icon; the design shows "₹".
  { label: 'Payment', href: routes.newPayment, icon: { glyph: '₹' }, tone: 'payment' },
  { label: 'Expense', href: routes.newExpense, icon: 'arrow-up-right', tone: 'expense' },
];

export function QuickActions() {
  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.label}
          style={styles.card}
          onPress={() => router.push(action.href)}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <IconTile
            icon={action.icon}
            background={colors.quickAction[action.tone].tile}
            color={colors.quickAction[action.tone].icon}
          />
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  card: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontFamily: fonts.semibold, fontSize: fontSizes.base, color: colors.ink },
});
