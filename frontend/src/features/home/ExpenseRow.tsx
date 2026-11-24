import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconTile } from '@/components/ui/IconTile';
import { colors, fonts, fontSizes, spacing } from '@/theme';
import { formatDayMonth } from '@/utils/date';
import { formatMoneyOut } from '@/utils/money';

import type { Expense } from './types';

/** "Salary · Karthik" (crew member, else the note). */
function title(expense: Expense): string {
  const detail = expense.crewMemberName ?? expense.note;
  return [expense.category?.name, detail].filter(Boolean).join(' · ');
}

/** "Meera's event · Salary · 3 Nov"; general expenses have no "…'s event" part. */
function subtitle(expense: Expense): string {
  const event = expense.eventClientName ? `${expense.eventClientName}'s event` : undefined;
  const date = expense.spentOn ? formatDayMonth(expense.spentOn) : undefined;
  return [event, expense.category?.name, date].filter(Boolean).join(' · ');
}

function ExpenseRowView({ expense }: { expense: Expense }) {
  return (
    <View style={styles.row}>
      <IconTile
        icon="arrow-up-right"
        background={colors.expenseIconTile}
        color={colors.expenses.figure}
        size={32}
      />
      <View style={styles.texts}>
        <Text style={styles.title}>{title(expense)}</Text>
        <Text style={styles.sub}>{subtitle(expense)}</Text>
      </View>
      {expense.amount ? <Text style={styles.amount}>{formatMoneyOut(expense.amount)}</Text> : null}
    </View>
  );
}

export const ExpenseRow = memo(ExpenseRowView);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  texts: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bold, fontSize: fontSizes.lg, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: fontSizes.md, color: colors.textMuted },
  amount: { fontFamily: fonts.bold, fontSize: fontSizes.title, color: colors.expenses.figure },
});
