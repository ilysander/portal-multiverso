import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StatusOpt = '' | 'alive' | 'dead' | 'unknown';

export type CharactersUIState = {
  name: string;
  species: string;
  status: StatusOpt;
};

const initialState: CharactersUIState = {
  name: '',
  species: '',
  status: '',
};

const charactersUISlice = createSlice({
  name: 'charactersUI',
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setSpecies(state, action: PayloadAction<string>) {
      state.species = action.payload;
    },
    setStatus(state, action: PayloadAction<StatusOpt>) {
      state.status = action.payload;
    },
    clear(state) {
      state.name = '';
      state.species = '';
      state.status = '';
    },
  },
});

export const { setName, setSpecies, setStatus, clear } = charactersUISlice.actions;
export const charactersUIReducer = charactersUISlice.reducer;
