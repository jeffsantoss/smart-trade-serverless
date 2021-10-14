import { Candle } from "./Candle"
import { Asset } from "./enums/Asset"
import { FibonacciLevel } from "./enums/FibonacciLevel"
import { OperationType } from "./enums/OperationType"
import { Status } from "./enums/Status"
import { FibonacciValue } from "./vo/FibonacciValue"
import { v4 as uuidv4 } from 'uuid';
import { Interval } from "./enums/Interval"
import { CandleEvent } from "./vo/CandleEvent"

export class Setup {
    id: string = uuidv4()
    asset: Asset
    interval: Interval
    candleMax: Candle
    candleMin: Candle
    operation: OperationType
    status: Status
    breakup: boolean = false
    corrected: boolean = false
    breakupAnyFib: boolean = false
    correctedAnyFib: boolean = false
    fiboRetracements: FibonacciValue[]
    fiboExtensions: FibonacciValue[]
    createdAt: number
    candleEvent: CandleEvent

    constructor(
        id: string,
        asset: Asset,
        interval: Interval,
        candleMax: Candle,
        candleMin: Candle,
        operation: OperationType,
        status: Status,
        breakup: boolean,
        corrected: boolean,
        breakupAnyFib: boolean,
        correctionAnyFib: boolean,
        fiboRetracements: FibonacciValue[],
        fiboExtensions: FibonacciValue[],
        createdAt: number
    ) {
        this.id = id
        this.asset = asset
        this.interval = interval
        this.candleMax = candleMax
        this.candleMin = candleMin
        this.operation = operation
        this.status = status
        this.breakup = breakup
        this.corrected = corrected
        this.breakupAnyFib = breakupAnyFib
        this.correctedAnyFib = correctionAnyFib
        this.fiboRetracements = fiboRetracements
        this.fiboExtensions = fiboExtensions
        this.createdAt = createdAt
        this.candleEvent = new CandleEvent(null, null, null)        
    }

    ocurredGainOrLoss(extensionLevelGain: FibonacciLevel, fibLevelLoss: FibonacciLevel, actualPrice: number): boolean {
        console.log(`Preço atual: ${actualPrice}`)

        const fibValueGain = this.fiboExtensions.find(f => f.level == extensionLevelGain).value
        const fibValueLoss = this.fiboRetracements.find(f => f.level == fibLevelLoss).value

        if (this.operation == OperationType.BUY && actualPrice >= fibValueGain) {
            console.log(`GAIN de ${this.operation}!`)
            this.status = Status.GAIN
            return true
        } else if (this.operation == OperationType.BUY && actualPrice <= fibValueLoss) {
            this.status = Status.LOSS
            console.log(`LOSS de ${this.operation}!`)

            this.operation = OperationType.SELL
            console.log(`Alterando tendência para ${this.operation}!`)
            return true
        } else if (this.operation == OperationType.SELL && actualPrice <= fibValueGain) {
            console.log(`GAIN de ${this.operation}!`)
            this.status = Status.GAIN
            return true
        } else if (this.operation == OperationType.SELL && actualPrice >= fibValueLoss) {
            this.status = Status.LOSS
            console.log(`LOSS de ${this.operation}!`)

            this.operation = OperationType.BUY
            console.log(`Alterando tendência para ${this.operation}!`)
            return true
        }

        return false
    }

    private breakupOnFibLevel(level: FibonacciLevel, candle: Candle): Boolean {
        const fibValue = this.fiboRetracements.find(f => f.level == level).value

        if (this.operation == OperationType.BUY) {
            return candle.actualPrice <= fibValue || candle.lowPrice <= fibValue
        }

        return candle.actualPrice >= fibValue || candle.highPrice >= fibValue
    }

    private correctedOnFibLevel(level: FibonacciLevel, candle: Candle): Boolean {
        const fibValue = this.fiboRetracements.find(f => f.level == level).value


        if (this.operation == OperationType.BUY) {
            return candle.actualPrice >= fibValue || candle.highPrice >= fibValue
        }

        return candle.actualPrice <= fibValue || candle.lowPrice <= fibValue

    }

    occurredEventOnFib(firstLevel: FibonacciLevel, operationLevel: FibonacciLevel, actualCandle: Candle): boolean {
        console.log(`Candle: ${JSON.stringify(actualCandle)}`)

        if (this.candleEvent.candle && !this.candleEvent.candle.finished()) {
            console.log("O candle que ocorreu o último evento ainda não foi finalizado")
            return false
        }

        if (this.breakupOnFibLevel(firstLevel, actualCandle) && !this.breakupAnyFib) {
            console.log(`ROMPEU a fib no nível ${firstLevel} | ${this.fiboRetracements.find(v => v.level == firstLevel).value} para operação de ${this.operation}`)

            this.breakupAnyFib = true
            this.candleEvent = new CandleEvent(actualCandle, "BREAKUP_ANY_FB", Date.now())
            return true
        }

        else if (this.correctedOnFibLevel(firstLevel, actualCandle) && this.breakupAnyFib && !this.correctedAnyFib) {
            console.log(`CORRIGIU a fib no nível ${firstLevel} | ${this.fiboRetracements.find(v => v.level == firstLevel).value} para operação de ${this.operation}`)
            this.correctedAnyFib = true
            this.candleEvent = new CandleEvent(actualCandle, "CORRECTED_ANY_FB", Date.now())
            return true
        }

        else if (this.breakupOnFibLevel(operationLevel, actualCandle) && !this.breakup) {
            console.log(`ROMPEU ${JSON.stringify(actualCandle)} na fib no nível ${operationLevel} | ${this.fiboRetracements.find(v => v.level == operationLevel).value} para operação de ${this.operation}`)
            this.breakup = true
            this.candleEvent = new CandleEvent(actualCandle, "BREAKUP", Date.now())
            return true
        }

        else if (this.correctedOnFibLevel(operationLevel, actualCandle) && this.breakup && !this.corrected) {
            console.log(`CORRIGIU na fib no nível ${operationLevel} | ${this.fiboRetracements.find(v => v.level == operationLevel).value} para operação de ${this.operation}`)
            this.corrected = true
            this.candleEvent = new CandleEvent(actualCandle, "CORRECTED", Date.now())
            return true
        }

        console.log("Nenhum evento com os valores de fibonacci")

        return false
    }

    public imReadyToOperate() {
        return this.breakup && this.corrected
    }
}