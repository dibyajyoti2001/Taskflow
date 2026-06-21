import mongoose from 'mongoose';

export async function connectTestDb(): Promise<void> {
  const uri = process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/taskflow_test';
  await mongoose.connect(uri);
}

export async function disconnectTestDb(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

export async function clearCollections(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}
