import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: any;

beforeAll(async () => {
  // start mongo memeory server
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // disconnect mongodb.
  await mongo.stop();
  await mongoose.connection.close();
});
