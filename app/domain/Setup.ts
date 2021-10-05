import { Candle } from "./Candle"
import { Asset } from "./enums/Asset"
import { FibonacciLevel } from "./enums/FibonacciLevel"
import { OperationType } from "./enums/OperationType"
import { Status } from "./enums/Status"
import { FibonacciValue } from "./vo/FibonacciValue"
import {v4 as uuidv4} from 'uuid';

export class Setup {
    id: string = uuidv4()
    asset: Asset
    candleMax: Candle
    candleMin: Candle
    operation: OperationType
    status: Status
    breakup: boolean = false
    breakupAnyFib: boolean = false
    correctionAnyFib: boolean = false
    fiboRetracements: FibonacciValue[]
    fiboExtensions: FibonacciValue[]
}