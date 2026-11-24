import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/ui/TabBar';
import { TABS } from '@/navigation/routes';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}
