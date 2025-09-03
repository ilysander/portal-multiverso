import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { RootNavigator, linking } from './navigation';

import { RealmProvider, useQuery } from '@/app/realm';
import { useOutboxSync } from '@/shared/offline/useOutboxSync';
import { Note } from '@/entities/note/model/Note';

import { Text, View, StyleSheet } from 'react-native';

const OutboxSyncGate: React.FC = () => {
  useOutboxSync();
  return null;
};

const LatestNotesPanel: React.FC = () => {
  const notes = useQuery(Note).sorted('updatedAt', true);
  const latest = notes.slice(0, 12);

  return (
    <View pointerEvents="none" style={styles.panel}>
      <Text style={styles.panelTitle}>Últimas notas</Text>
      {latest.length === 0 ? (
        <Text style={styles.empty}>—</Text>
      ) : (
        latest.map(n => (
          <View key={n._id.toHexString()} style={styles.row}>
            <Text style={styles.status}>{n.status === 'pending' ? '⏳' : '✓'}</Text>
            <Text style={styles.text} numberOfLines={1}>
              {n.text}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

export const Providers: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RealmProvider>
          <ReduxProvider store={store}>
            <NavigationContainer linking={linking}>
              <RootNavigator />
            </NavigationContainer>
          </ReduxProvider>

          {/* <LatestNotesPanel /> */}

          <OutboxSyncGate />
        </RealmProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 8,
    right: 8,
    maxWidth: 280,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  panelTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  status: {
    width: 18,
    textAlign: 'center',
  },
  text: {
    flex: 1,
    color: '#333',
  },
  empty: {
    color: '#999',
  },
});
