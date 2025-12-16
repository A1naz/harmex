import mongoose from 'mongoose';
const config = useRuntimeConfig();

export const MultiChatConnection = mongoose.createConnection(
  config.MONGO_DB_URI || config.OZON_DB_URI
);


