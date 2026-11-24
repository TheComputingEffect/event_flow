import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme';
import { monthShort } from '@/utils/date';
import { formatMoney, formatMoneyCompact, isPositiveMoney } from '@/utils/money';

import { axisStep, axisTicks, barPercent } from './chartScale';
import type { MonthPoint } from './types';

type Props = { points: readonly MonthPoint[]; currentMonth?: string };
type Step = ReturnType<typeof axisStep>;

const PLOT_HEIGHT = 210;
const AXIS_WIDTH = 34;
const LABEL_HEIGHT = 24;
const TICK_TEXT_HEIGHT = 12;

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function MonthDetail({ point }: { point?: MonthPoint }) {
  if (!point?.month) return null;
  const parts = [monthShort(point.month)];
  if (point.received) parts.push(`Received ${formatMoney(point.received)}`);
  if (point.expenses) parts.push(`Expenses ${formatMoney(point.expenses)}`);
  return (
    <Text style={styles.detail} testID="chart-month-detail">
      {parts.join(' · ')}
    </Text>
  );
}

/** Dashed gridlines with their ₹ labels, top (largest) to bottom (0). */
function Grid({ ticks }: { ticks: string[] }) {
  return (
    <View style={styles.grid} pointerEvents="none">
      {ticks.map((tick, i) => {
        const top = (i * PLOT_HEIGHT) / (ticks.length - 1);
        return (
          <View key={tick} style={[styles.gridRow, { top }]}>
            <Text style={styles.axisText}>
              {isPositiveMoney(tick) ? formatMoneyCompact(tick) : '0'}
            </Text>
            <View style={styles.gridline} />
          </View>
        );
      })}
    </View>
  );
}

type ColumnProps = { point: MonthPoint; highlighted: boolean; step: Step; onPress: () => void };

function MonthColumn({ point, highlighted, step, onPress }: ColumnProps) {
  const received = highlighted ? colors.chart.received : colors.chart.receivedLight;
  const expenses = highlighted ? colors.chart.expenses : colors.chart.expensesLight;
  const label = point.month ? monthShort(point.month) : '';
  return (
    <Pressable
      style={styles.column}
      onPress={onPress}
      testID={`chart-month-${point.month}`}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.bars}>
        <View
          style={[
            styles.bar,
            { height: `${barPercent(point.received, step)}%`, backgroundColor: received },
          ]}
        />
        <View
          style={[
            styles.bar,
            { height: `${barPercent(point.expenses, step)}%`, backgroundColor: expenses },
          ]}
        />
      </View>
      <Text style={[styles.month, highlighted && styles.monthActive]}>{label}</Text>
    </Pressable>
  );
}

/** Revenue vs expenses for the last 6 months, drawn with plain Views. Tapping a month needs no API call. */
export function RevenueChart({ points, currentMonth }: Props) {
  const [picked, setPicked] = useState<string | undefined>();
  const highlightedMonth = picked ?? currentMonth;
  const step = axisStep(points);
  return (
    <View style={styles.wrap}>
      <View style={styles.legend}>
        <LegendItem color={colors.chart.received} label="Received" />
        <LegendItem color={colors.chart.expenses} label="Expenses" />
      </View>
      <MonthDetail point={picked ? points.find((p) => p.month === picked) : undefined} />
      <View style={styles.chart}>
        <Grid ticks={axisTicks(step)} />
        <View style={styles.columns}>
          {points.map((point) => (
            <MonthColumn
              key={point.month}
              point={point}
              step={step}
              highlighted={point.month === highlightedMonth}
              onPress={() => setPicked(point.month)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: 10 },
  legend: { flexDirection: 'row', gap: spacing.xl },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 2 },
  legendText: { fontFamily: fonts.regular, fontSize: fontSizes.base, color: colors.textLabel },
  detail: { fontFamily: fonts.semibold, fontSize: fontSizes.md, color: colors.ink },
  chart: { height: PLOT_HEIGHT + LABEL_HEIGHT, marginTop: TICK_TEXT_HEIGHT / 2 },
  grid: { position: 'absolute', top: 0, left: 0, right: 0, height: PLOT_HEIGHT },
  gridRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -TICK_TEXT_HEIGHT / 2,
  },
  axisText: {
    width: AXIS_WIDTH,
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    lineHeight: TICK_TEXT_HEIGHT,
    color: colors.textFaint,
  },
  gridline: { flex: 1, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: colors.gridLine },
  columns: { flex: 1, flexDirection: 'row', marginLeft: AXIS_WIDTH },
  column: { flex: 1, alignItems: 'center' },
  bars: { height: PLOT_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  bar: { width: 10, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  month: {
    marginTop: 6,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textLabel,
  },
  monthActive: { fontFamily: fonts.bold, color: colors.ink },
});
