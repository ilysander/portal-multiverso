import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useGetCharactersQuery, type Character } from '@/shared/rmApi';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CharactersStackParamList } from '@/app/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { setName, setSpecies, setStatus, clear, type StatusOpt } from './state';

type Props = NativeStackScreenProps<CharactersStackParamList, 'CharacterList'>;

export default function CharacterListScreen({ navigation }: Props) {
  const dispatch = useDispatch();

  const { name, species, status } = useSelector((s: RootState) => s.charactersUI);

  const [nameInput, setNameInput] = useState(name);
  const [speciesInput, setSpeciesInput] = useState(species);

  useEffect(() => {
    setNameInput(name);
  }, [name]);
  useEffect(() => {
    setSpeciesInput(species);
  }, [species]);

  const [page, setPage] = useState(1);

  const argsKey = JSON.stringify({ name, species, status });
  const argsKeyRef = useRef(argsKey);
  useEffect(() => {
    argsKeyRef.current = argsKey;
  }, [argsKey]);

  const { data, isFetching, isLoading, isError } = useGetCharactersQuery({
    page,
    name: name || undefined,
    species: species || undefined,
    status: (status || undefined) as any,
  });

  const [items, setItems] = useState<Character[]>([]);
  const ids = useRef<Set<number>>(new Set());

  useEffect(() => {
    setItems([]);
    ids.current = new Set();
    setPage(1);
  }, [argsKey]);

  // agregar nuevos resultados
  useEffect(() => {
    const incoming = data?.results ?? [];
    if (!incoming.length) return;
    setItems(prev => {
      const out = [...prev];
      for (const ch of incoming) {
        if (!ids.current.has(ch.id)) {
          ids.current.add(ch.id);
          out.push(ch);
        }
      }
      return out;
    });
  }, [data]);

  const hasNext = useMemo(() => Boolean(data?.info?.next), [data?.info?.next]);

  const [userRefreshing, setUserRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setUserRefreshing(true);
    setPage(1);
    setItems([]);
    ids.current = new Set();
    const stop = setInterval(() => {
      if (!isFetching) {
        clearInterval(stop);
        setUserRefreshing(false);
      }
    }, 150);
  }, [isFetching]);

  const onEndReached = useCallback(() => {
    if (!isFetching && hasNext) setPage(p => p + 1);
  }, [isFetching, hasNext]);

  const applyFilters = useCallback(() => {
    dispatch(setName(nameInput.trim()));
    dispatch(setSpecies(speciesInput.trim()));
  }, [dispatch, nameInput, speciesInput]);

  const clearFilters = useCallback(() => {
    dispatch(clear());
    setNameInput('');
    setSpeciesInput('');
    setPage(1);
    setItems([]);
    ids.current = new Set();
  }, [dispatch]);

  const goDetail = useCallback(
    (id: number) => {
      navigation.navigate('CharacterDetail', { id: String(id) });
    },
    [navigation],
  );

  const noResults = (!isFetching && items.length === 0) || (isError && items.length === 0);

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={styles.filters}>
            <Text style={styles.title}>Characters</Text>

            <View style={styles.row}>
              <TextInput
                placeholder="Buscar por nombre… (p. ej., Rick)"
                value={nameInput}
                onChangeText={setNameInput}
                style={styles.input}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={applyFilters}
              />
            </View>

            <View style={[styles.row, { marginTop: 8 }]}>
              <TextInput
                placeholder="Especie… (p. ej., Human, Alien)"
                value={speciesInput}
                onChangeText={setSpeciesInput}
                style={styles.input}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={applyFilters}
              />
            </View>

            <View style={[styles.row, { marginTop: 8 }]}>
              {(['', 'alive', 'dead', 'unknown'] as StatusOpt[]).map(opt => (
                <TouchableOpacity
                  key={opt || 'all'}
                  onPress={() => dispatch(setStatus(opt))}
                  style={[styles.chip, status === opt && styles.chipActive]}
                >
                  <Text style={status === opt ? styles.chipTextActive : styles.chipText}>
                    {opt === '' ? 'All' : opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.row, { marginTop: 8 }]}>
              <TouchableOpacity onPress={applyFilters} style={[styles.button, styles.primary]}>
                <Text style={styles.buttonText}>Aplicar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearFilters} style={[styles.button, styles.ghost]}>
                <Text style={styles.buttonGhostText}>Limpiar</Text>
              </TouchableOpacity>
            </View>

            {noResults ? <Text style={styles.hint}>No se encontraron resultados.</Text> : null}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => goDetail(item.id)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.species} • {item.status}
            </Text>
          </TouchableOpacity>
        )}
        onEndReachedThreshold={0.4}
        onEndReached={onEndReached}
        refreshControl={<RefreshControl refreshing={userRefreshing} onRefresh={onRefresh} />}
        ListFooterComponent={
          isFetching && hasNext ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  item: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    marginTop: 2,
    color: '#666',
  },
  filters: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  chipActive: {
    backgroundColor: '#222',
  },
  chipText: {
    color: '#222',
  },
  chipTextActive: {
    color: '#fff',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: '#222',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
  },
  buttonGhostText: {
    color: '#333',
    fontWeight: '600',
  },
  hint: {
    marginTop: 10,
    color: '#666',
  },
});
