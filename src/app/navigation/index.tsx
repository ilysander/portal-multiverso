import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { LinkingOptions, PathConfigMap } from '@react-navigation/native';
import { getStateFromPath as defaultGetStateFromPath } from '@react-navigation/native';

import DiagnosticsScreen from '@/features/diagnostics/DiagnosticsScreen';
import CharacterListScreen from '@/features/characters/CharacterListScreen';
import CharacterDetailScreen from '@/features/characters/CharacterDetailScreen';

export type RootTabParamList = {
  CharactersStack: undefined;
  Diagnostics: undefined;
};

export type CharactersStackParamList = {
  CharacterList: { query?: string } | undefined;
  CharacterDetail: { id: string };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<CharactersStackParamList>();

const CharactersStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="CharacterList"
      component={CharacterListScreen}
      options={{ title: 'Characters' }}
    />
    <Stack.Screen
      name="CharacterDetail"
      component={CharacterDetailScreen}
      options={{ title: 'Character Detail' }}
    />
  </Stack.Navigator>
);

export const RootNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="CharactersStack"
      component={CharactersStackNavigator}
      options={{ title: 'Characters' }}
    />
    <Tab.Screen
      name="Diagnostics"
      component={DiagnosticsScreen}
      options={{ title: 'Diagnostics' }}
    />
  </Tab.Navigator>
);

const charactersStackConfig: PathConfigMap<CharactersStackParamList> = {
  CharacterList: {
    path: 'search',
    parse: { query: (q: unknown) => (q == null ? undefined : String(q)) },
  },
  CharacterDetail: 'character/:id',
};

export const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['portalmultiverso://'],
  config: {
    screens: {
      CharactersStack: {
        screens: charactersStackConfig,
      },
      Diagnostics: 'diagnostics',
    },
  },
  getStateFromPath: (path, options) => {
    const state = defaultGetStateFromPath(path, options);
    if (!state) return state;

    const tabRoutes = state.routes ?? [];
    const csIndex = tabRoutes.findIndex((r: any) => r.name === 'CharactersStack');
    if (csIndex === -1) return state;

    const csRoute: any = tabRoutes[csIndex];
    const stackState = csRoute.state;
    const stackRoutes = stackState?.routes ?? [];

    if (stackRoutes.length === 1 && stackRoutes[0]?.name === 'CharacterDetail') {
      const detail = stackRoutes[0];
      csRoute.state = {
        ...stackState,
        routes: [{ name: 'CharacterList' }, detail],
        index: 1,
      };
      return state;
    }
    return state;
  },
};
