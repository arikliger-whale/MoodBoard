/**
 * Socket.io API Route
 * Handles WebSocket connections for real-time updates
 */

import { NextRequest } from 'next/server'
import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

// Store Socket.io server instance
let io: SocketIOServer | undefined

export async function GET(req: NextRequest) {
  // Initialize Socket.io server if not already initialized
  if (!io) {
    // @ts-ignore - Access the underlying HTTP server
    const httpServer: HTTPServer = (req as any).socket.server

    if (httpServer) {
      io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          methods: ['GET', 'POST'],
        },
      })

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        // Join organization room
        socket.on('join-org', (organizationId: string) => {
          socket.join(`org:${organizationId}`)
          console.log(`Client ${socket.id} joined org:${organizationId}`)
        })

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id)
        })
      })

      // @ts-ignore - Store io instance on server
      httpServer.io = io
    }
  }

  return new Response('Socket.io server initialized', { status: 200 })
}

// Export helper to get io instance
export function getIO(): SocketIOServer | undefined {
  return io
}
