import Realm from 'realm';
import { BSON } from 'realm';

export class Note extends Realm.Object<Note> {
  _id!: BSON.ObjectId;
  text!: string;
  status!: 'pending' | 'synced';
  updatedAt!: Date;
  characterId?: number;
  remoteId?: number | null;

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
      remoteId: { type: 'int', optional: true },
    },
  };
}
