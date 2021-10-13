import { Inject, Service } from 'typedi';
import 'reflect-metadata';
import { Setup } from '../../domain/Setup';
import { Order } from '../../domain/Order';
import { TickerService } from '../../infra/service/TickerService';
import { OrderService } from '../../infra/service/OrderService';

@Service()
export class OrderCreatorUseCase {

  @Inject()
  private readonly tickerService: TickerService

  @Inject()
  private readonly orderService: OrderService

  async createBySetup(setup: Setup) {
    const order = new Order(setup.operation, "LIMIT", setup.asset, Number.parseInt(process.env.VALUE_TO_OPERATE), await this.tickerService.getActualPrice(setup.asset))

    console.log(`Solicitação da criação da ordem: ${JSON.stringify(order)}`)

    const response = await this.orderService.create(order)

    console.log(`Criação da ordem efetuada com sucesso: ${JSON.stringify(response)}`)
  }
}