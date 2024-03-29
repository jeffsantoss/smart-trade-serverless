import { Candle } from "./Candle";
import { OperationType } from "./enums/OperationType";

export class Graphic {
    candles: Candle[]

    constructor(candles: Candle[]) {
        this.candles = candles
    }

    getAllAfterMaxOrMinCandleAccordingTheOperation(operation : OperationType): Candle[] {
        const maxOrMinCandle = operation == OperationType.BUY ? this.getMaxCandle() : this.getMinCandle()

        return this.candles.filter(c => c.startTime >= maxOrMinCandle.endTime)
    }
    
    getAtualOperation(): OperationType {
        return this.getMaxCandle().startTime >= this.getMinCandle().startTime ? OperationType.BUY : OperationType.SELL
    }

    getMaxCandle(): Candle {
        return this.candles.reduce((candleMax, currentCandle) => (candleMax.highPrice > currentCandle.highPrice) ? candleMax : currentCandle);
    }

    getMinCandle(): Candle {
        return this.candles.reduce((candleMin, currentCandle) => (candleMin.lowPrice < currentCandle.lowPrice) ? candleMin : currentCandle);
    }
}