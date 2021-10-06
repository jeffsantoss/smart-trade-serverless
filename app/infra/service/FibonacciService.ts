import { Service } from "typedi"
import { FibonacciLevel } from "../../domain/enums/FibonacciLevel"
import { OperationType } from "../../domain/enums/OperationType"
import { FibonacciValue } from "../../domain/vo/FibonacciValue"

@Service()
export class FibonacciService {

    async calculateRetracementValues(operation: OperationType, high: number, low: number): Promise<FibonacciValue[]> {
        if(operation == OperationType.BUY){ 
           [high, low] = [low, high]
        }

        const difference = high - low
        
        return [
            {
                level: FibonacciLevel._0,
                value: low
            },
            {
                level: FibonacciLevel._0236,
                value: low + difference * .236
            },
            {
                level: FibonacciLevel._0382,
                value: low + difference * .382
            },
            {
                level: FibonacciLevel._050,
                value: low + difference * .50
            },
            {
                level: FibonacciLevel._0618,
                value: low + difference * .618
            },
            {
                level: FibonacciLevel._0786,
                value: low + difference * .786
            },
            {
                level: FibonacciLevel._100,
                value: high
            }
        ]
    }

    async calculateExtensionsValue(operation: OperationType, high: number, low: number): Promise<FibonacciValue[]> {
        if(operation == OperationType.BUY){ 
            [high, low] = [low, high]
         }

        const difference = high - low
        
        return [
            {
                level: FibonacciLevel._0,
                value: low
            },
            {
                level: FibonacciLevel._0236,
                value: high + difference * .236
            },
            {
                level: FibonacciLevel._0382,
                value: high + difference * .382
            },
            {
                level: FibonacciLevel._050,
                value: high + difference * .50
            },
            {
                level: FibonacciLevel._0618,
                value: high + difference * .618
            },
            {
                level: FibonacciLevel._0786,
                value: high + difference * .786
            },
            {
                level: FibonacciLevel._100,
                value: high + difference
            }
        ]
    }
}