import { Candle } from "./Candle"
import { Asset } from "./enums/Asset"
import { FibonacciLevel } from "./enums/FibonacciLevel"
import { OperationType } from "./enums/OperationType"
import { Status } from "./enums/Status"
import { FibonacciValue } from "./vo/FibonacciValue"
import { v4 as uuidv4 } from 'uuid';
import { Interval } from "./enums/Interval"

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
    correctionAnyFib: boolean = false
    fiboRetracements: FibonacciValue[]
    fiboExtensions: FibonacciValue[]
    createdAt: number
    candleEvent: Candle

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
        this.correctionAnyFib = correctionAnyFib
        this.fiboRetracements = fiboRetracements
        this.fiboExtensions = fiboExtensions
        this.createdAt = createdAt
    }

    gainOrLossOrNothing(extensionLevelGain: FibonacciLevel, fibLevelLoss: FibonacciLevel, actualPrice: number) {
        const fibValueGain = this.fiboExtensions.find(f => f.level == extensionLevelGain).value
        const fibValueLoss = this.fiboRetracements.find(f => f.level == fibLevelLoss).value

        if (this.operation == OperationType.BUY && actualPrice >= fibValueGain) {
            console.log(`GAIN de ${this.operation}!`)
            this.status = Status.GAIN
        } else if (this.operation == OperationType.BUY && actualPrice <= fibValueLoss) {
            this.status = Status.LOSS
            console.log(`LOSS de ${this.operation}!`)

            this.operation = OperationType.SELL
            console.log(`Alterando tendência para ${this.operation}!`)
        } else if (this.operation == OperationType.SELL && actualPrice <= fibValueGain) {
            console.log(`GAIN de ${this.operation}!`)
            this.status = Status.GAIN
        } else if (this.operation == OperationType.SELL && actualPrice >= fibValueLoss) {
            this.status = Status.LOSS
            console.log(`LOSS de ${this.operation}!`)

            this.operation = OperationType.BUY
            console.log(`Alterando tendência para ${this.operation}!`)
        }
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

        if (this.breakup) {
            if (this.operation == OperationType.BUY) {
                return candle.actualPrice >= fibValue || candle.highPrice >= fibValue
            }

            return candle.actualPrice <= fibValue || candle.lowPrice <= fibValue
        }
    }

    async analyze(firstLevel: FibonacciLevel, operationLevel: FibonacciLevel, actualCandle: Candle) {
        if (this.candleEvent && !this.candleEvent.finished()) {
            console.log("O último candle que ocorreu um evento ainda não foi finalizado.")
            return
        }

        if (this.breakupOnFibLevel(firstLevel, actualCandle)) {
            console.log(`Candle ${JSON.stringify(actualCandle)} rompeu a fib no nível ${firstLevel} | ${this.fiboRetracements.find(v => v.level == firstLevel).value} para operação de ${this.operation}`)

            this.breakupAnyFib = true
            this.candleEvent = actualCandle
        } 
        
        else if (this.correctedOnFibLevel(firstLevel, actualCandle)) {
            console.log(`Candle ${JSON.stringify(actualCandle)} corrigiu a fib no nível ${firstLevel} | ${this.fiboRetracements.find(v => v.level == firstLevel).value} para operação de ${this.operation}`)
            this.correctionAnyFib = true
            this.candleEvent = actualCandle
        } 
        
        else if (this.breakupOnFibLevel(operationLevel, actualCandle)) {
            console.log(`Candle ${JSON.stringify(actualCandle)} rompeu a fib no nível ${operationLevel} | ${this.fiboRetracements.find(v => v.level == operationLevel).value} para operação de ${this.operation}`)
            this.breakup = true
            this.candleEvent = actualCandle
        }

        else if (this.correctedOnFibLevel(operationLevel, actualCandle)) {
            console.log(`Candle ${JSON.stringify(actualCandle)} corrigu a fib no nível ${operationLevel} | ${this.fiboRetracements.find(v => v.level == operationLevel).value} para operação de ${this.operation}`)
            this.corrected = true
            this.candleEvent = actualCandle
        } 
        
        else {
            console.log("Nenhum evento com os valores de fibonacci")
        }
    }

    public imReadyToOperate() {
        return this.breakup && this.corrected
    }
}