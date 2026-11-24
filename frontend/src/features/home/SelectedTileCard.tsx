import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors, fonts, fontSizes, spacing } from '@/theme';

import { MiniTiles } from './MiniTiles';
import { tileView } from './tileContent';
import type { DashboardHome, TileKey } from './types';

type Props = { data: DashboardHome; selected: TileKey; onSelect: (tile: TileKey) => void };

export function SelectedTileCard({ data, selected, onSelect }: Props) {
  const view = tileView(data, selected);
  const tone = colors[selected];
  return (
    <Card testID={`selected-tile-${selected}`}>
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.label}>{view.label}</Text>
          {view.pill ? (
            <Pill
              testID="tile-pill"
              label={view.pill}
              background={tone.pillBg}
              color={tone.pillText}
            />
          ) : null}
        </View>
        {view.headline ? <Text style={styles.headline}>{view.headline}</Text> : null}
        {view.barPercent !== undefined ? (
          <ProgressBar percent={view.barPercent} color={tone.bar} testID="tile-bar" />
        ) : null}
        {view.subtitle ? <Text style={styles.subtitle}>{view.subtitle}</Text> : null}
      </View>
      <MiniTiles data={data} selected={selected} onSelect={onSelect} />
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { padding: 14, paddingHorizontal: spacing.lg, gap: 6 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontFamily: fonts.medium, fontSize: fontSizes.lg, color: colors.textLabel },
  headline: { fontFamily: fonts.bold, fontSize: fontSizes.hero, color: colors.ink },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSizes.md, color: colors.textMuted },
});
