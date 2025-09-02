import Realm from 'realm';
import { BSON } from 'realm';

export type OutboxOp = 'create' | 'update' | 'delete';

export class OutboxEntry extends Realm.Object<OutboxEntry> {
  _id!: BSON.ObjectId;
  op!: OutboxOp;
  noteLocalId!: BSON.ObjectId;
  payload!: string;
  attempt!: number;
  lastError?: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  static primaryKey = '_id';

  static schema: Realm.ObjectSchema = {
    name: 'OutboxEntry',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      op: 'string',
      noteLocalId: 'objectId',
      payload: 'string',
      attempt: { type: 'int', default: 0 },
      lastError: { type: 'string', optional: true },
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}
