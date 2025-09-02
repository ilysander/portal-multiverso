import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
  // adicionales
};
type PageInfo = { count: number; pages: number; next: string | null; prev: string | null };
type CharactersResponse = { info: PageInfo; results: Character[] };

export type CharactersQuery = {
  page?: number;
  name?: string;
  status?: 'alive' | 'dead' | 'unknown';
  species?: string;
};

export type Episode = {
  id: number;
  name: string;
  air_date: string;
  episode: string;
};

export const rmApi = createApi({
  reducerPath: 'rmApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://rickandmortyapi.com/api/' }),
  endpoints: builder => ({
    getCharacters: builder.query<CharactersResponse, CharactersQuery | void>({
      query: args => {
        const page = args?.page ?? 1;
        const params = new URLSearchParams({ page: String(page) });
        if (args?.name) params.set('name', args.name);
        if (args?.status) params.set('status', args.status);
        if (args?.species) params.set('species', args.species);
        return `character?${params.toString()}`;
      },
    }),
    getCharacter: builder.query<Character, string | number>({
      query: id => `character/${id}`,
    }),
    getEpisodesByIds: builder.query<Episode[], number[]>({
      query: ids => `episode/${ids.join(',')}`,
      transformResponse: (resp: Episode | Episode[]) => (Array.isArray(resp) ? resp : [resp]),
    }),
  }),
});

export const { useGetCharactersQuery, useGetCharacterQuery, useGetEpisodesByIdsQuery } = rmApi;
