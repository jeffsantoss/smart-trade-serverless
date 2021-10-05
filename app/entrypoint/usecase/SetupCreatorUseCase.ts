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

    const graphic = {
      candles: await this.candleService.find({
        asset: request.asset,
        interval: request.interval,
        startTime: request.candleToStart,
        limit: 100
      })
    } as Graphic

    const maxCandle = graphic.getMaxCandle()
    const minCandle = graphic.getMinCandle()
    const fiboRetracements = this.fibonacciService.calculateRetracementValues(maxCandle.highPrice, minCandle.lowPrice)
    const fiboExtensions = this.fibonacciService.calculateExtensionsValue(maxCandle.highPrice, minCandle.lowPrice)

    const setup = await this.setupRepository.create({
      id: uuidv4(),
      breakup: false,
      breakupAnyFib: false,
      correctionAnyFib: false,
      status: Status.RUNNING,
      operation: graphic.getAtualOperation(),
      asset: request.asset,
      candleMax: maxCandle,
      candleMin: minCandle,
      fiboExtensions: await fiboExtensions,
      fiboRetracements: await fiboRetracements
    })

    this.setupRepository.create(setup)
  }
}