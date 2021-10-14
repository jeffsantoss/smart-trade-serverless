import { Candle } from "../Candle"

export class CandleEvent {
    candle: Candle
    eventType: string
    when: number
    
  constructor(candle: Candle, eventType: string, when: number) {
    this.candle = candle
    this.eventType = eventType
    this.when = when
  }

}