/**
 * Socket.io Server Instance
 * Singleton for Socket.io server
 */

import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null

export function getSocketServer(httpServer?: HTTPServer): SocketIOServer {
  if (!io && httpServer) {
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
      path: '/api/socket',
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Join organization room for scoped events
      socket.on('join-org', (organizationId: string) => {
        socket.join(`org:${organizationId}`)
        console.log(`Client ${socket.id} joined org:${organizationId}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }

  if (!io) {
    throw new Error('Socket.io server not initialized')
  }

  return io
}

export function emitToOrganization(
  organizationId: string,
  event: string,
  data: any
) {
  if (io) {
    io.to(`org:${organizationId}`).emit(event, data)
  }
}
