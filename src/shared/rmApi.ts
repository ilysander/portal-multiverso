import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
};
type PageInfo = { count: number; pages: number; next: string | null; prev: string | null; };
type CharactersResponse = { info: PageInfo; results: Character[]; };

export const rmApi = createApi({
  reducerPath: 'rmApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://rickandmortyapi.com/api/' }),
  endpoints: (builder) => ({
    getCharacters: builder.query<CharactersResponse, number | void>({
      query: (page = 1) => `character?page=${page}`,
    }),
  }),
});

export const { useGetCharactersQuery } = rmApi;
