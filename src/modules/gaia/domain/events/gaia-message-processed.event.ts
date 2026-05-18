export const GAIA_MESSAGE_PROCESSED = 'gaia.message.processed';

export class GaiaMessageProcessedEvent {
  readonly queryId: string;
  readonly text: string;

  constructor(params: { queryId: string; text: string }) {
    this.queryId = params.queryId;
    this.text = params.text;
  }
}
