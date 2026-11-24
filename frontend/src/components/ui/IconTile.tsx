import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, radius } from '@/theme';

export type FeatherName = ComponentProps<typeof Feather>['name'];

type Props = {
  background: string;
  color: string;
  /** A Feather icon, or a text glyph (e.g. "₹") when Feather has no such icon. */
  icon: FeatherName | { glyph: string };
  size?: number;
};

const DEFAULT_SIZE = 30;
const ICON_RATIO = 0.5;

export function IconTile({ background, color, icon, size = DEFAULT_SIZE }: Props) {
  const iconSize = Math.round(size * ICON_RATIO);
  return (
    <View style={[styles.tile, { backgroundColor: background, width: size, height: size }]}>
      {typeof icon === 'string' ? (
        <Feather name={icon} size={iconSize} color={color} />
      ) : (
        <Text style={[styles.glyph, { color, fontSize: iconSize + 2 }]}>{icon.glyph}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontFamily: fonts.regular },
});
