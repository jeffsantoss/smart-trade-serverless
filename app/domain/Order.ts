import { OrderType } from 'aws-sdk/clients/workdocs';
import { v4 as uuidv4 } from 'uuid';
import { Asset } from './enums/Asset';
import { OperationType } from './enums/OperationType';

export class Order {
    id: string = uuidv4()
    operation: OperationType
    type: OrderType
    asset: Asset
    value: number
    currentPrice: number
    quantity: number


  constructor(
    operation: OperationType, 
    type: OrderType, 
    asset: Asset, 
    value: number,
    currentPrice: number
) {
    this.operation = operation
    this.type = type
    this.asset = asset
    this.value = value
    this.currentPrice = currentPrice
    this.quantity = Number.parseFloat((this.value / this.currentPrice).toFixed(5))
  }

}