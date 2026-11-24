import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, radius } from '@/theme';

import type { SectionView } from './sectionContent';

/**
 * The section card is drawn in three parts (top, rows, bottom) so that its rows
 * can be FlatList items while it still looks like one card.
 */
export function SectionTop({ section }: { section: SectionView }) {
  const { action } = section;
  return (
    <View style={[styles.side, styles.top]}>
      <SectionHeader
        title={section.title}
        subtitle={section.subtitle}
        actionLabel={action?.label}
        actionChevron={action?.chevron}
        onAction={action ? () => router.push(action.href) : undefined}
      />
    </View>
  );
}

export function SectionRow({ children }: { children: ReactNode }) {
  return <View style={styles.side}>{children}</View>;
}

export function SectionBottom({
  section,
  children,
}: {
  section: SectionView;
  children?: ReactNode;
}) {
  const showEmpty = !children && section.items.length === 0 && section.emptyText;
  return (
    <View style={[styles.side, styles.bottom]}>
      {children}
      {showEmpty ? <EmptyState text={section.emptyText ?? ''} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  side: {
    backgroundColor: colors.card,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  top: {
    borderTopWidth: 1,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  bottom: {
    flexGrow: 1,
    minHeight: 24,
    borderBottomWidth: 1,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
});
