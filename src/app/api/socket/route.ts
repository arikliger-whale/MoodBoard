/**
 * Socket.io API Route
 * Handles WebSocket connections for real-time updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

// Force dynamic rendering - Socket.io doesn't work with static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Store Socket.io server instance
let io: SocketIOServer | undefined

export async function GET(req: NextRequest) {
  // Initialize Socket.io server if not already initialized
  if (!io) {
    // @ts-ignore - Access the underlying HTTP server
    const httpServer: HTTPServer = (req as any)?.socket?.server

    if (!httpServer) {
      // In serverless environments (like Vercel), Socket.io needs a persistent server
      // This is expected and not an error - Socket.io won't work in serverless
      return NextResponse.json(
        {
          error: 'Socket.io requires a persistent Node.js server',
          message: 'WebSocket functionality is not available in serverless deployments'
        },
        { status: 503 }
      )
    }

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

  return NextResponse.json({ status: 'ok', message: 'Socket.io server initialized' })
}

// Export helper to get io instance
export function getIO(): SocketIOServer | undefined {
  return io
}
