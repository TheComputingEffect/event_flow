import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

type Props = { percent: number; color: string; height?: number; testID?: string };

const DEFAULT_HEIGHT = 5;

/** Display-only bar; `percent` is 0–100. */
export function ProgressBar({ percent, color, height = DEFAULT_HEIGHT, testID }: Props) {
  const width = `${Math.min(Math.max(percent, 0), 100)}%` as const;
  return (
    <View style={[styles.track, { height }]} testID={testID}>
      <View style={[styles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.track, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
