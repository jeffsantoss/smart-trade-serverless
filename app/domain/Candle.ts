export class Candle {
    openPrice: number
    highPrice: number
    lowPrice: number
    closePrice: number
    volumeOffered: number
    operatedVolume: number
    startTime: number
    endTime: number
    actualPrice: number

    constructor(
        openPrice: number,
        highPrice: number,
        lowPrice: number,
        closePrice: number,
        volumeOffered: number,
        operatedVolume: number,
        startTime: number,
        endTime: number
    ) {
        this.openPrice = openPrice
        this.highPrice = highPrice
        this.lowPrice = lowPrice
        this.closePrice = closePrice
        this.volumeOffered = volumeOffered
        this.operatedVolume = operatedVolume
        this.startTime = startTime
        this.endTime = endTime
    }
}