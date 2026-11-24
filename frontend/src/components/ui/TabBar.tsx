import Feather from '@expo/vector-icons/Feather';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TABS } from '@/navigation/routes';
import { colors, fonts, fontSizes, radius, spacing } from '@/theme';

type TabItemProps = { tab: (typeof TABS)[number]; focused: boolean; onPress: () => void };

function TabItem({ tab, focused, onPress }: TabItemProps) {
  const color = focused ? colors.tab.active : colors.tab.inactive;
  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={tab.title}
    >
      <View style={[styles.iconPill, focused && styles.iconPillActive]}>
        <Feather name={tab.icon} size={22} color={color} />
      </View>
      <Text style={[styles.label, { color }, focused && styles.labelActive]}>{tab.title}</Text>
    </Pressable>
  );
}

/** White bottom tab bar; the active tab is blue with a light-blue pill. */
export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.sm }]}>
      {TABS.map((tab) => {
        const route = state.routes.find((r) => r.name === tab.name);
        if (!route) return null;
        return (
          <TabItem
            key={tab.name}
            tab={tab}
            focused={activeName === tab.name}
            onPress={() => navigateToTab(route.key)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.tab.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  iconPill: {
    width: 52,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: { backgroundColor: colors.tab.activePill },
  label: { fontFamily: fonts.medium, fontSize: fontSizes.sm },
  labelActive: { fontFamily: fonts.bold },
});
