import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { isUnauthorized, NOT_SIGNED_IN_MESSAGE } from '@/api/errors';
import { AppHeader } from '@/components/ui/AppHeader';
import { colors } from '@/theme';

import { HomeContent } from './HomeContent';
import { HomeMessageCard } from './HomeMessageCard';
import { HomeSkeleton } from './HomeSkeleton';
import { useDashboardHome } from './useDashboardHome';

function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  return { refreshing, onRefresh };
}

/** US-03 Home. One API call: GET /dashboard/home. */
export function HomeScreen() {
  const { data, error, refetch } = useDashboardHome();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  let body;
  if (isUnauthorized(error)) {
    body = <HomeMessageCard message={NOT_SIGNED_IN_MESSAGE} testID="home-not-signed-in" />;
  } else if (data) {
    body = <HomeContent data={data} refreshing={refreshing} onRefresh={onRefresh} />;
  } else if (error) {
    body = (
      <HomeMessageCard message={error.message} onRetry={() => refetch()} testID="home-error" />
    );
  } else {
    body = <HomeSkeleton />;
  }

  return (
    <View style={styles.screen}>
      <AppHeader unreadCount={data?.unreadNotifications} />
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
});
