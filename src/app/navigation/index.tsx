import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DiagnosticsScreen from '@/features/diagnostics/DiagnosticsScreen';

export type RootStackParamList = {
  Diagnostics: undefined;
  // Character: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Diagnostics" component={DiagnosticsScreen} options={{title: 'Diagnostics'}} />
  </Stack.Navigator>
);

// Esqueleto de deep links:
export const linking = {
  prefixes: ['portal://', 'app://'],
  config: {
    screens: {
      Diagnostics: 'diagnostics',
      // Character: 'character/:id'
    },
  },
};
