import { Inject, Service } from 'typedi';
import { OperationType } from '../../domain/enums/OperationType';
import { Status } from '../../domain/enums/Status';
import { SetupRepository } from '../../infra/dataprovider/SetupRepository';
import { CreateSetupRequest } from '../request/CreateSetupRequest';
import { v4 as uuidv4 } from 'uuid';
import 'reflect-metadata';
import { CandleService } from '../../infra/service/CandleService';
import { Graphic } from '../../domain/Graphic';
import { FibonacciService } from '../../infra/service/FibonacciService';
import { Setup } from '../../domain/Setup';
import { FibonacciValue } from '../../domain/vo/FibonacciValue';
import { FibonacciLevel } from '../../domain/enums/FibonacciLevel';

@Service()
export class SetupCreatorUseCase {

  @Inject()
  private readonly setupRepository: SetupRepository

  @Inject()
  private readonly candleService: CandleService

  @Inject()
  private readonly fibonacciService: FibonacciService

  async create(request: CreateSetupRequest) {
    console.log(`Request: ${JSON.stringify(request)}`)

    const graphic = new Graphic(await this.candleService.find({
      asset: request.asset,
      interval: request.interval,
      startTime: request.candleToStart,
      limit: 100
    }))

    const maxCandle = graphic.getMaxCandle()
    const minCandle = graphic.getMinCandle()
    const operation = graphic.getAtualOperation()
    let fiboRetracements: Promise<FibonacciValue[]>
    let fiboExtensions: Promise<FibonacciValue[]>

    if (operation == OperationType.BUY) {
      fiboRetracements = this.fibonacciService.calculateRetracementValues(minCandle.lowPrice, maxCandle.highPrice)
      fiboExtensions = this.fibonacciService.calculateExtensionsValue(maxCandle.highPrice, minCandle.lowPrice)
    } else {
      fiboRetracements = this.fibonacciService.calculateRetracementValues(maxCandle.highPrice, minCandle.lowPrice)
      fiboExtensions = this.fibonacciService.calculateExtensionsValue(minCandle.lowPrice, maxCandle.highPrice)
    }    

    const setupToCreate = new Setup(uuidv4(), request.asset, request.interval, maxCandle, minCandle, operation, Status.STARTED, false, false, false, false, await fiboRetracements, await fiboExtensions, Date.now())

    await this.calculateRetroactively(graphic, setupToCreate)

    await this.setupRepository.create(setupToCreate)
  }

  private async calculateRetroactively(graphic: Graphic, setup: Setup) {
    const allAfter = graphic.getAllAfterMaxOrMinCandleAccordingTheOperation(setup.operation)

    Promise.all(allAfter.map(c => {
      setup.occurredEventOnFib(FibonacciLevel._0236, FibonacciLevel._050, c)
    }))
  }
}