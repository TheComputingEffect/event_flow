import { StyleSheet, Text, View } from 'react-native';

import { Pill } from '@/components/ui/Pill';
import { colors, fonts, fontSizes, radius, spacing } from '@/theme';
import { monthName, previousMonthShort } from '@/utils/date';
import { formatMoney } from '@/utils/money';

import type { DashboardHome } from './types';

type Props = { month?: string; profit: DashboardHome['profit'] };

function changeLabel(pct: number, month: string): string {
  const rounded = Math.round(pct);
  const sign = rounded >= 0 ? '+' : '−';
  return `${sign}${Math.abs(rounded)}% vs ${previousMonthShort(month)}`;
}

function ChangePill({ pct, month }: { pct?: number | null; month?: string }) {
  if (pct === undefined || pct === null || !month) return null;
  const up = pct >= 0;
  return (
    <Pill
      testID="profit-change"
      label={changeLabel(pct, month)}
      background={up ? colors.profit.upBackground : colors.profit.neutralBackground}
      color={up ? colors.profit.upText : colors.profit.neutralText}
    />
  );
}

/** BR-09: profit so far this month and the change vs last month. Not tappable. */
export function ProfitCard({ month, profit }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.decoration} />
      <View style={styles.texts}>
        <Text style={styles.label}>{month ? `Profit · ${monthName(month)}` : 'Profit'}</Text>
        {profit?.profitSoFar ? (
          <Text style={styles.amount}>{formatMoney(profit.profitSoFar)}</Text>
        ) : null}
      </View>
      <ChangePill pct={profit?.changeVsLastMonthPct} month={month} />
    </View>
  );
}

const DECORATION_SIZE = 120;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.profit.background,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    shadowColor: colors.profit.background,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  decoration: {
    position: 'absolute',
    width: DECORATION_SIZE,
    height: DECORATION_SIZE,
    borderRadius: DECORATION_SIZE / 2,
    borderWidth: 16,
    borderColor: colors.profit.decoration,
    top: -48,
    right: -28,
  },
  texts: { flex: 1 },
  label: { fontFamily: fonts.regular, fontSize: fontSizes.md, color: colors.profit.label },
  amount: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.profit.amount,
  },
});
