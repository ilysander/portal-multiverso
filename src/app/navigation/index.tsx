import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { LinkingOptions, PathConfigMap } from '@react-navigation/native';

import DiagnosticsScreen from '@/features/diagnostics/DiagnosticsScreen';
import CharacterListScreen from '@/features/characters/CharacterListScreen';
import CharacterDetailScreen from '@/features/characters/CharacterDetailScreen';

export type RootTabParamList = {
  CharactersStack: undefined;
  Diagnostics: undefined;
};

export type CharactersStackParamList = {
  CharacterList: undefined;
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
  CharacterList: 'characters',
  CharacterDetail: 'character/:id',
};

export const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['portal://', 'app://'],
  config: {
    screens: {
      CharactersStack: {
        screens: charactersStackConfig,
      },
      Diagnostics: 'diagnostics',
    },
  },
};
