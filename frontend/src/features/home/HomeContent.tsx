import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItem } from 'react-native';

import { routes } from '@/navigation/routes';
import { colors, spacing } from '@/theme';

import { ExpenseRow } from './ExpenseRow';
import { PendingClientRow } from './PendingClientRow';
import { ProfitCard } from './ProfitCard';
import { QuickActions } from './QuickActions';
import { RevenueChart } from './RevenueChart';
import { SectionBottom, SectionRow, SectionTop } from './SectionCardParts';
import { sectionView, type SectionItem, type SectionView } from './sectionContent';
import { SelectedTileCard } from './SelectedTileCard';
import { DEFAULT_TILE, type DashboardHome, type TileKey } from './types';
import { UpcomingEventRow } from './UpcomingEventRow';
import { useReminder } from './useReminder';

type Props = { data: DashboardHome; refreshing: boolean; onRefresh: () => void };

const openEvent = (eventId: string) => router.push(routes.eventDetail(eventId));

type ReminderState = ReturnType<typeof useReminder>;

function SectionItemRow({ item, reminder }: { item: SectionItem; reminder: ReminderState }) {
  if (item.kind === 'expense') return <ExpenseRow expense={item.expense} />;
  if (item.kind === 'event') return <UpcomingEventRow event={item.event} onOpen={openEvent} />;
  const id = item.row.eventId;
  return (
    <PendingClientRow
      row={item.row}
      reminding={id !== undefined && id === reminder.remindingEventId}
      errorMessage={
        id !== undefined && id === reminder.failedEventId ? reminder.errorMessage : undefined
      }
      onOpen={openEvent}
      onRemind={reminder.remind}
    />
  );
}

function useRenderItem(): ListRenderItem<SectionItem> {
  const reminder = useReminder();
  const { remind, remindingEventId, failedEventId, errorMessage } = reminder;
  return useCallback<ListRenderItem<SectionItem>>(
    // Rows sit inside the section card's side borders.
    ({ item }) => (
      <SectionRow>
        <SectionItemRow
          item={item}
          reminder={{ remind, remindingEventId, failedEventId, errorMessage }}
        />
      </SectionRow>
    ),
    [remind, remindingEventId, failedEventId, errorMessage],
  );
}

type HeaderProps = {
  data: DashboardHome;
  tile: TileKey;
  onSelect: (tile: TileKey) => void;
  section: SectionView;
};

function HomeHeader({ data, tile, onSelect, section }: HeaderProps) {
  return (
    <View style={styles.header}>
      <ProfitCard month={data.month} profit={data.profit} />
      <QuickActions />
      <SelectedTileCard data={data} selected={tile} onSelect={onSelect} />
      <SectionTop section={section} />
    </View>
  );
}

export function HomeContent({ data, refreshing, onRefresh }: Props) {
  const [tile, setTile] = useState<TileKey>(DEFAULT_TILE);
  const section = sectionView(data, tile);
  const renderItem = useRenderItem();
  const chart =
    tile === 'received' && data.chart?.length ? (
      <RevenueChart points={data.chart} currentMonth={data.month} />
    ) : undefined;
  return (
    <FlatList
      testID="home-list"
      data={section.items}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      ListHeaderComponent={
        <HomeHeader data={data} tile={tile} onSelect={setTile} section={section} />
      }
      ListFooterComponent={<SectionBottom section={section}>{chart}</SectionBottom>}
      ListFooterComponentStyle={styles.footer}
      contentContainerStyle={styles.content}
      style={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.page },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  header: { paddingTop: spacing.xs, gap: 10 },
  footer: { flexGrow: 1 },
});
