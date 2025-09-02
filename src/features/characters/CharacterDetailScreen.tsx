import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CharactersStackParamList } from '@/app/navigation';
import { useGetCharacterQuery, useGetEpisodesByIdsQuery } from '@/shared/rmApi';

import { useQuery } from '@/app/realm';
import { Note } from '@/entities/note/model/Note';
import { useNoteActions } from '@/entities/note/useNoteActions';
import { BSON } from 'realm';

type Props = NativeStackScreenProps<CharactersStackParamList, 'CharacterDetail'>;

export default function CharacterDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;

  const {
    data: character,
    isFetching: fetchingCharacter,
    isLoading: loadingCharacter,
    refetch: refetchCharacter,
    isError: isCharacterError,
  } = useGetCharacterQuery(id);

  const episodeIds = useMemo(() => {
    const urls = (character as any)?.episode as string[] | undefined;
    if (!urls || urls.length === 0) return [] as number[];
    return urls.map(u => Number(u.split('/').pop())).filter(n => Number.isFinite(n)) as number[];
  }, [character]);

  const {
    data: episodes = [],
    isFetching: fetchingEpisodes,
    refetch: refetchEpisodes,
  } = useGetEpisodesByIdsQuery(episodeIds, { skip: episodeIds.length === 0 });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCharacter(), refetchEpisodes()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchCharacter, refetchEpisodes]);

  const { createNote, updateNote, deleteNote } = useNoteActions();
  const notes = useQuery(Note).filtered('characterId == $0', Number(id)).sorted('updatedAt', true);

  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<BSON.ObjectId | null>(null);
  const [editingText, setEditingText] = useState('');

  const saveNewNote = useCallback(() => {
    const txt = newText.trim();
    if (!txt) return;
    createNote({ characterId: Number(id), text: txt });
    setNewText('');
  }, [newText, id, createNote]);

  const startEdit = useCallback((note: Note) => {
    setEditingId(note._id);
    setEditingText(note.text);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingId) return;
    const txt = editingText.trim();
    if (!txt) {
      setEditingId(null);
      setEditingText('');
      return;
    }
    updateNote({ noteId: editingId, text: txt });
    setEditingId(null);
    setEditingText('');
  }, [editingId, editingText, updateNote]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingText('');
  }, []);

  const removeNote = useCallback(
    (noteId: BSON.ObjectId) => {
      deleteNote({ noteId });
    },
    [deleteNote],
  );

  const loading = loadingCharacter || (fetchingCharacter && !character);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <View style={{ height: 8 }} />
        <Button title="Volver" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (!character) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {isCharacterError ? 'No se pudo cargar el personaje.' : 'No encontrado.'}
        </Text>
        <View style={{ height: 8 }} />
        <Button title="Volver" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const episodesSorted = [...episodes].sort((a, b) => a.id - b.id);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Image source={{ uri: character.image }} style={styles.avatar} />
      <Text style={styles.title}>{character.name}</Text>
      <Text style={styles.meta}>
        {character.species} • {character.status}
      </Text>

      <View style={styles.row}>
        <Button title="Volver" onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notas ({notes.length})</Text>

        <View style={{ width: '100%', gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              placeholder="Escribe una nota…"
              value={newText}
              onChangeText={setNewText}
              style={styles.input}
              autoCorrect={false}
              autoCapitalize="sentences"
              returnKeyType="done"
              onSubmitEditing={saveNewNote}
            />
            <Button title="Guardar" onPress={saveNewNote} />
          </View>

          {notes.map(n => (
            <View key={n._id.toHexString()} style={styles.noteItem}>
              {editingId && editingId.equals(n._id) ? (
                <>
                  <TextInput
                    value={editingText}
                    onChangeText={setEditingText}
                    style={styles.inputEdit}
                    autoCorrect={false}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                    onSubmitEditing={commitEdit}
                  />
                  <Button title="OK" onPress={commitEdit} />
                  <Button title="Cancelar" onPress={cancelEdit} />
                </>
              ) : (
                <>
                  <Text style={{ flex: 1 }}>{n.text}</Text>
                  <Text style={{ marginRight: 8 }}>{n.status === 'pending' ? '⏳' : '✓'}</Text>
                  <Button title="Editar" onPress={() => startEdit(n)} />
                  <Button title="Borrar" color="#b00" onPress={() => removeNote(n._id)} />
                </>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Episodios ({episodesSorted.length})</Text>
        {fetchingEpisodes && episodesSorted.length === 0 ? (
          <Text>Cargando episodios…</Text>
        ) : episodesSorted.length === 0 ? (
          <Text style={styles.hint}>Este personaje no tiene episodios listados.</Text>
        ) : (
          episodesSorted.map(ep => (
            <View key={ep.id} style={styles.episodeItem}>
              <Text style={styles.episodeName}>{ep.name}</Text>
              <Text style={styles.episodeMeta}>
                {ep.episode} • {ep.air_date}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    alignItems: 'center', 
    gap: 8 
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  meta: {
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  section: {
    width: '100%',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  episodeItem: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
    marginBottom: 8,
    width: '100%',
  },
  episodeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  episodeMeta: {
    marginTop: 2,
    color: '#666',
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
  inputEdit: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 10,
  },
  error: {
    color: '#b00',
  },
  hint: {
    color: '#666',
  },
});
