import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from './store';
import {RootNavigator, linking} from './navigation';
import {RealmProvider} from '@/entities/note/model/Note';

export const Providers: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <RealmProvider>
          <ReduxProvider store={store}>
            <NavigationContainer linking={linking}>
              <RootNavigator />
            </NavigationContainer>
          </ReduxProvider>
        </RealmProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
