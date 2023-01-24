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
    breakup: number = 0
    corrected: number = 0
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
        breakup: number,
        corrected: number,
        breakupAnyFib: boolean,
        correctionAnyFib: boolean,
        fiboRetracements: FibonacciValue[],
        fiboExtensions: FibonacciValue[],
        createdAt: number,
        candleEvent: CandleEvent
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
        this.candleEvent = candleEvent
    }

    ocurredGainOrLoss(levelGain: FibonacciLevel, fibLevelLoss: FibonacciLevel, actualPrice: number): boolean {
        console.log(`Preço atual => ${actualPrice}`)

        let fibValueGain = this.fiboRetracements.find(f => f.level == levelGain).value

        const fibValueLoss = this.fiboRetracements.find(f => f.level == fibLevelLoss).value

        if (this.operation == OperationType.BUY && actualPrice >= fibValueGain) {
            console.log(`[GAIN] Operação => ${this.operation} | Preço => ${actualPrice}`)
            this.status = Status.GAIN
            return true
        } else if (this.operation == OperationType.BUY && actualPrice <= fibValueLoss) {
            this.status = Status.LOSS
            console.log(`[LOSS] Operação => ${this.operation} | Preço => ${actualPrice}`)
            this.operation = OperationType.SELL
            console.log(`Alterando tendência para ${this.operation}!`)
            return true
        } else if (this.operation == OperationType.SELL && actualPrice <= fibValueGain) {
            console.log(`[GAIN] Operação => ${this.operation} | Preço => ${actualPrice}`)
            this.status = Status.GAIN
            return true
        } else if (this.operation == OperationType.SELL && actualPrice >= fibValueLoss) {
            this.status = Status.LOSS
            console.log(`[LOSS] Operação => ${this.operation} | Preço => ${actualPrice}`)
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

    occurredEventOnFib(firstLevel: FibonacciLevel, breakUpCorrectionLevel: FibonacciLevel, operationLevel: FibonacciLevel, actualCandle: Candle): boolean {
        console.log(`Candle: ${JSON.stringify(actualCandle)}`)

        if (this.candleEvent.candle && !(this.candleEvent.candle.endTime <= Date.now())) {
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

        else if (this.breakupOnFibLevel(breakUpCorrectionLevel, actualCandle) && this.breakup == 0) {
            console.log(`[1° ROMPIMENTO] Nível Fibonacci => ${breakUpCorrectionLevel} | Valor Fib => ${this.fiboRetracements.find(v => v.level == breakUpCorrectionLevel).value} | Operação => ${this.operation}`)
            this.breakup = 1
            this.candleEvent = new CandleEvent(actualCandle, "BREAKUP_ONE_TIME", Date.now())
            console.log(`Evento criado => ${JSON.stringify(this.candleEvent)}`)
            return true
        }

        else if (this.correctedOnFibLevel(breakUpCorrectionLevel, actualCandle) && this.breakup == 1 && this.corrected == 0) {
            console.log(`[1° CORREÇÃO] Nível Fibonnaci => ${breakUpCorrectionLevel} | Valor Fibonnaci => ${this.fiboRetracements.find(v => v.level == breakUpCorrectionLevel).value} | Operação => ${this.operation}`)
            this.corrected = 1
            this.candleEvent = new CandleEvent(actualCandle, "CORRECTED_ONE_TIME", Date.now())
            return true
        }

        else if (this.breakupOnFibLevel(breakUpCorrectionLevel, actualCandle) && this.breakup == 1 && this.corrected == 1) {
            console.log(`[2° ROMPIMENTO] Nível Fibonacci => ${breakUpCorrectionLevel} | Valor Fib => ${this.fiboRetracements.find(v => v.level == breakUpCorrectionLevel).value} | Operação => ${this.operation}`)
            this.breakup = 2
            this.candleEvent = new CandleEvent(actualCandle, "BREAKUP_SECOND_TIME", Date.now())
            return true
        }

        else if (this.correctedOnFibLevel(operationLevel, actualCandle) && this.breakup == 2 && this.corrected == 1) {
            console.log(`[2° CORREÇÃO] Nível Fibonnaci => ${breakUpCorrectionLevel} | Valor Fibonnaci => ${this.fiboRetracements.find(v => v.level == breakUpCorrectionLevel).value} | Operação => ${this.operation}`)
            this.corrected = 2
            this.candleEvent = new CandleEvent(actualCandle, "CORRECTED_SECOND_TIME", Date.now())
            return true
        }

        console.log("Nenhum evento com os valores de fibonacci")

        return false
    }

    public imReadyToOperate() {
        return this.breakup == 2 && this.corrected == 2
    }
}