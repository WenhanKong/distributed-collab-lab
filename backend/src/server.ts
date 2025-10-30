import { Server } from '@hocuspocus/server'
import { config } from './config.js'

const server = new Server({
    port: config.port,
    async onConnect(data) {
        console.log(`Client connected to: ${data.documentName}`)
    },
    async onDisconnect(data) {
        console.log(`Client disconnected from: ${data.documentName}`)
    },
    async onLoadDocument(data) {
        console.log(`Loading document: ${data.documentName}`)
        return null
    },
    async onStoreDocument(data) {
        console.log(`Storing document: ${data.documentName}`)
    }
})

server.listen()

console.log(`🚀 Hocuspocus server running`)
console.log(`   Port: ${config.port}`)
console.log(`   WebSocket: ws://localhost:${config.port}`)