import Feather from '@expo/vector-icons/Feather';
import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors, fonts, fontSizes, radius, spacing } from '@/theme';
import { formatDateShort } from '@/utils/date';
import { formatMoney, isPositiveMoney, ratioPercent } from '@/utils/money';

import type { BalanceDueRow } from './types';

type Props = {
  row: BalanceDueRow;
  reminding: boolean;
  errorMessage?: string;
  onOpen: (eventId: string) => void;
  onRemind: (eventId: string) => void;
};

function subtitle(row: BalanceDueRow): string {
  const parts = [row.eventName, row.eventDate ? formatDateShort(row.eventDate) : undefined];
  return parts.filter(Boolean).join(' · ');
}

function RemindButton({ busy, onPress }: { busy: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.remind, busy && styles.remindBusy]}
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel="Remind"
      accessibilityState={{ disabled: busy, busy }}
    >
      {busy ? (
        <ActivityIndicator size="small" color={colors.remind.text} />
      ) : (
        <Feather name="bell" size={13} color={colors.remind.text} />
      )}
      <Text style={styles.remindText}>Remind</Text>
    </Pressable>
  );
}

function PendingClientRowView({ row, reminding, errorMessage, onOpen, onRemind }: Props) {
  const { eventId, received, agreed, balance } = row;
  const hasTotals = received !== undefined && agreed !== undefined;
  // E-20: no Remind when nothing is due.
  const canRemind = eventId !== undefined && balance !== undefined && isPositiveMoney(balance);
  return (
    <Pressable style={styles.row} onPress={() => eventId && onOpen(eventId)}>
      <View style={styles.top}>
        <View style={styles.texts}>
          <Text style={styles.name}>{row.clientName}</Text>
          <Text style={styles.sub}>{subtitle(row)}</Text>
        </View>
        {balance ? <Text style={styles.balance}>{formatMoney(balance)}</Text> : null}
      </View>
      {hasTotals ? (
        <ProgressBar percent={ratioPercent(received, agreed)} color={colors.toCollect.bar} />
      ) : null}
      <View style={styles.bottom}>
        <Text style={styles.sub}>
          {hasTotals ? `${formatMoney(received)} of ${formatMoney(agreed)} received` : ''}
        </Text>
        {canRemind ? <RemindButton busy={reminding} onPress={() => onRemind(eventId)} /> : null}
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </Pressable>
  );
}

export const PendingClientRow = memo(PendingClientRowView);

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  top: { flexDirection: 'row', alignItems: 'center' },
  texts: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: fontSizes.title, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: fontSizes.md, color: colors.textMuted },
  balance: { fontFamily: fonts.bold, fontSize: fontSizes.figure, color: colors.toCollect.figure },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  remind: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.remind.border,
    borderRadius: radius.sm,
  },
  remindBusy: { opacity: 0.6 },
  remindText: { fontFamily: fonts.semibold, fontSize: fontSizes.md, color: colors.remind.text },
  error: { fontFamily: fonts.regular, fontSize: fontSizes.sm, color: colors.expenses.figure },
});
