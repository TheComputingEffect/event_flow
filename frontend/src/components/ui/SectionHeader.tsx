import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionChevron?: boolean;
  onAction?: () => void;
};

export function SectionHeader({ title, subtitle, actionLabel, actionChevron, onAction }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {actionLabel ? (
          <Pressable onPress={onAction} accessibilityRole="link" style={styles.action}>
            <Text style={styles.actionLabel}>{actionLabel}</Text>
            {actionChevron ? (
              <Feather name="chevron-right" size={14} color={colors.primary} />
            ) : null}
          </Pressable>
        ) : null}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: 14, paddingBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.bold, fontSize: fontSizes.title, color: colors.ink },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionLabel: { fontFamily: fonts.semibold, fontSize: fontSizes.lg, color: colors.primary },
});
