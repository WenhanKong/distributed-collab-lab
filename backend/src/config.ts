import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: Number(process.env.PORT || 3000),
    storageDir: process.env.STORAGE_DIR || './storage',
    maxDocumentSize: parseInt(process.env.MAX_DOCUMENT_SIZE || '1048576', 10), // 1 MB default,
    maxRooms: parseInt(process.env.MAX_ROOMS || '100', 10),
    heartbeatInterval: parseInt(process.env.HEARTBEAT_INTERVAL || '30000', 10), // 30 seconds
};
