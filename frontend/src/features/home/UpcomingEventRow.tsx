import Feather from '@expo/vector-icons/Feather';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing } from '@/theme';
import { dateBlockParts, formatTime } from '@/utils/date';

import type { EventSummary } from './types';

type Props = { event: EventSummary; onOpen: (eventId: string) => void };

function DateBlock({ date }: { date?: string }) {
  const parts = date ? dateBlockParts(date) : undefined;
  return (
    <View style={styles.dateBlock}>
      <Text style={styles.weekday}>{parts?.weekday}</Text>
      <Text style={styles.day}>{parts?.day}</Text>
    </View>
  );
}

function UpcomingEventRowView({ event, onOpen }: Props) {
  const detail = [event.eventType, event.startTime ? formatTime(event.startTime) : undefined];
  return (
    <Pressable
      style={styles.row}
      onPress={() => event.id && onOpen(event.id)}
      accessibilityRole="button"
      testID={`event-row-${event.id}`}
    >
      <DateBlock date={event.startDate} />
      <View style={styles.texts}>
        <Text style={styles.name}>{event.client?.name}</Text>
        <Text style={styles.sub}>{detail.filter(Boolean).join(' · ')}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

export const UpcomingEventRow = memo(UpcomingEventRowView);

const BLOCK_SIZE = 38;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  dateBlock: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE + 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.dateBlock.border,
    backgroundColor: colors.dateBlock.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekday: { fontFamily: fonts.semibold, fontSize: 10, color: colors.dateBlock.weekday },
  day: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 20, color: colors.ink },
  texts: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: fontSizes.lg, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: fontSizes.md, color: colors.textMuted },
});
