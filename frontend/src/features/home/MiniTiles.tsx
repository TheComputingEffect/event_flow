import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes } from '@/theme';

import { miniTileValue, TILE_LABELS } from './tileContent';
import { TILE_ORDER, type DashboardHome, type TileKey } from './types';

type Props = { data: DashboardHome; selected: TileKey; onSelect: (tile: TileKey) => void };

/** The three tiles that are not selected, in Received / To collect / Expenses / Events order. */
export function MiniTiles({ data, selected, onSelect }: Props) {
  const others = TILE_ORDER.filter((tile) => tile !== selected);
  return (
    <View style={styles.row}>
      {others.map((tile, index) => {
        const value = miniTileValue(data, tile);
        return (
          <Pressable
            key={tile}
            testID={`mini-tile-${tile}`}
            style={[styles.tile, index > 0 && styles.tileDivider]}
            onPress={() => onSelect(tile)}
            accessibilityRole="button"
            accessibilityLabel={TILE_LABELS[tile]}
          >
            <Text style={styles.label}>{TILE_LABELS[tile]}</Text>
            {value ? (
              <Text style={[styles.value, { color: colors[tile].figure }]}>{value}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.divider },
  tile: { flex: 1, alignItems: 'center', paddingVertical: 9, gap: 1 },
  tileDivider: { borderLeftWidth: 1, borderLeftColor: colors.divider },
  label: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.textLabel },
  value: { fontFamily: fonts.bold, fontSize: fontSizes.figure },
});
