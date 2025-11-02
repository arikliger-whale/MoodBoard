/**
 * Socket.io Event Types
 * Defines all socket events used in the application
 */

export enum SocketEvent {
  // Client events
  CLIENT_CREATED = 'client:created',
  CLIENT_UPDATED = 'client:updated',
  CLIENT_DELETED = 'client:deleted',

  // Project events (future)
  PROJECT_CREATED = 'project:created',
  PROJECT_UPDATED = 'project:updated',
  PROJECT_DELETED = 'project:deleted',

  // Material events (future)
  MATERIAL_CREATED = 'material:created',
  MATERIAL_UPDATED = 'material:updated',
  MATERIAL_DELETED = 'material:deleted',
}

export interface SocketEventData {
  [SocketEvent.CLIENT_CREATED]: { client: any }
  [SocketEvent.CLIENT_UPDATED]: { client: any }
  [SocketEvent.CLIENT_DELETED]: { clientId: string }
  [SocketEvent.PROJECT_CREATED]: { project: any }
  [SocketEvent.PROJECT_UPDATED]: { project: any }
  [SocketEvent.PROJECT_DELETED]: { projectId: string }
  [SocketEvent.MATERIAL_CREATED]: { material: any }
  [SocketEvent.MATERIAL_UPDATED]: { material: any }
  [SocketEvent.MATERIAL_DELETED]: { materialId: string }
}
