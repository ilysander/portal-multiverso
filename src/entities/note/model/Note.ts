import Realm from 'realm';
import {createRealmContext} from '@realm/react';
import {BSON} from 'realm';

export class Note extends Realm.Object<Note> {
  _id!: BSON.ObjectId;
  text!: string;
  status!: 'pending' | 'synced';
  updatedAt!: Date;
  characterId?: number;

  static primaryKey = '_id';

  static schema: Realm.ObjectSchema = {
    name: 'Note',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      text: 'string',
      status: 'string',
      updatedAt: 'date',
      characterId: { type: 'int', optional: true },
    },
  };
}

export const {RealmProvider, useRealm, useQuery} = createRealmContext({
  schema: [Note],
  schemaVersion: 1,
});
