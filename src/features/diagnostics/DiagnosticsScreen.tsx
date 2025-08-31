import React, {useCallback} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {useGetCharactersQuery} from '@/shared/rmApi';
import NetInfo, {useNetInfo} from '@react-native-community/netinfo';
import {Note, useQuery, useRealm} from '@/entities/note/model/Note';
import Animated, {useSharedValue, useAnimatedStyle, withSpring, withTiming} from 'react-native-reanimated';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';

const DiagnosticsScreen: React.FC = () => {
  const {data, isFetching, refetch, error} = useGetCharactersQuery(1);

  const realm = useRealm();
  const notes = useQuery(Note);

  const createNote = useCallback(() => {
    realm.write(() => {
      realm.create('Note', {
        _id: new Realm.BSON.ObjectId(),
        text: 'Nueva nota',
        status: 'pending',
        updatedAt: new Date(),
        characterId: undefined,
      });
    });
  }, [realm]);

  const clearNotes = useCallback(() => {
    realm.write(() => {
      realm.delete(notes);
    });
  }, [realm, notes]);

  const net = useNetInfo();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const tap = Gesture.Tap().onStart(() => {
    scale.value = withSpring(scale.value === 1 ? 0.9 : 1);
    opacity.value = withTiming(opacity.value === 1 ? 0.6 : 1, {duration: 150});
  });

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnostics</Text>

      <View style={styles.card}>
        <Text style={styles.section}>RTK Query</Text>
        <Text>
          {isFetching ? 'Cargando...' : `Personajes (total info.count): ${data?.info?.count ?? '—'}`}
        </Text>
        {!!error && <Text style={styles.error}>Error al consultar API</Text>}
        <Button title="Refetch" onPress={() => refetch()} />
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Realm</Text>
        <Text>Notas en Realm: {notes.length}</Text>
        <View style={styles.row}>
          <View style={styles.btn}><Button title="Crear nota" onPress={createNote} /></View>
          <View style={styles.btn}><Button title="Borrar todo" color="#C03" onPress={clearNotes} /></View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>NetInfo</Text>
        <Text>Conectado: {net.isConnected ? 'Sí' : 'No'}</Text>
        <Text>Tipo: {net.type}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>RNGH + Reanimated</Text>
        <GestureDetector gesture={tap}>
          <Animated.View style={[styles.box, boxStyle]} />
        </GestureDetector>
        <Text style={styles.hint}>Toca el cuadro para animar</Text>
      </View>
    </View>
  );
};

export default DiagnosticsScreen;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, gap: 16},
  title: {fontSize: 24, fontWeight: '600', marginBottom: 4},
  section: {fontSize: 18, fontWeight: '600', marginBottom: 8},
  card: {padding: 12, borderRadius: 12, backgroundColor: '#f2f2f2'},
  row: {flexDirection: 'row', gap: 8, marginTop: 8},
  btn: {flex: 1},
  error: {color: '#C00', marginTop: 4},
  box: {width: 100, height: 100, borderRadius: 12, backgroundColor: '#4aa'},
  hint: {marginTop: 8, color: '#555'}
});
