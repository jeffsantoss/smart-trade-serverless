import { Inject, Service } from 'typedi';
import { Candle } from '../../domain/Candle';
import { OperationType } from '../../domain/enums/OperationType';
import { Status } from '../../domain/enums/Status';
import { SetupRepository } from '../../infra/dataprovider/SetupRepository';
import { SetupRequest } from '../request/SetupRequest';
import { v4 as uuidv4 } from 'uuid';
import 'reflect-metadata';
import { CandleService } from '../../infra/service/CandleService';
import { Graphic } from '../../domain/Graphic';
import { Interval } from '../../domain/enums/Interval';
import { FibonacciService } from '../../infra/service/FibonacciService';

@Service()
export class SetupCreatorUseCase {

  @Inject()
  private readonly setupRepository: SetupRepository

  @Inject()
  private readonly candleService: CandleService

  @Inject()
  private readonly fibonacciService: FibonacciService

  async create(request: SetupRequest) {
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
    const fiboRetracements = this.fibonacciService.calculateRetracementValues(operation, maxCandle.highPrice, minCandle.lowPrice)
    const fiboExtensions = this.fibonacciService.calculateExtensionsValue(operation, maxCandle.highPrice, minCandle.lowPrice)

    const setup = await this.setupRepository.create({
      id: uuidv4(),
      breakup: false,
      breakupAnyFib: false,
      correctionAnyFib: false,
      status: Status.RUNNING,
      operation: operation,
      asset: request.asset,
      candleMax: maxCandle,
      candleMin: minCandle,
      fiboExtensions: await fiboExtensions,
      fiboRetracements: await fiboRetracements
    })

    this.setupRepository.create(setup)
  }
}