/**
 * Nombres de los eventos del socket de GaIA Live.
 * Debe mantenerse sincronizado con el enum homónimo del frontend
 * (`front/src/modules/gaia/types/gaia-live.types.ts`).
 */
export enum EGaiaLiveEvent {
  // Client → Server
  START = 'live:start',
  AUDIO = 'live:audio',
  TEXT = 'live:text',
  END = 'live:end',
  // Server → Client
  READY = 'live:ready',
  AUDIO_RESPONSE = 'live:audio_response',
  TEXT_RESPONSE = 'live:text_response',
  PENDING_ACTION = 'live:pending_action',
  TURN_COMPLETE = 'live:turn_complete',
  QUOTA_UPDATE = 'live:quota_update',
  QUOTA_EXCEEDED = 'live:quota_exceeded',
  ERROR = 'live:error',
}
