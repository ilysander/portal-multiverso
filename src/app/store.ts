import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rmApi } from '@/shared/rmApi';
import { charactersUIReducer } from '@/features/characters/state';

export const store = configureStore({
  reducer: {
    [rmApi.reducerPath]: rmApi.reducer,
    charactersUI: charactersUIReducer,
  },
  middleware: getDefault => getDefault().concat(rmApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
