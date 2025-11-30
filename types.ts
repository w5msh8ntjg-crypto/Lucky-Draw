export enum DrawStatus {
  IDLE = 'IDLE',
  COUNTDOWN = 'COUNTDOWN',
  WINNER = 'WINNER'
}

export interface Participant {
  id: string;
  name: string;
}
