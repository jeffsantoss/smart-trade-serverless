import { Inject, Service } from 'typedi';
import { Status } from '../../domain/enums/Status';
import { SetupRepository } from '../../infra/dataprovider/SetupRepository';
import 'reflect-metadata';
import { TickerService } from '../../infra/service/TickerService';
import { FibonacciLevel } from '../../domain/enums/FibonacciLevel';
import { SetupCreatorUseCase } from './SetupCreatorUseCase';
import { OperationType } from '../../domain/enums/OperationType';
import { CandleService } from '../../infra/service/CandleService';

@Service()
export class SetupUpdaterUseCase {

  @Inject()
  private readonly setupRepository: SetupRepository

  @Inject()
  private readonly setupCreatorUseCase: SetupCreatorUseCase

  @Inject()
  private readonly candleService: CandleService

  private readonly FIB_EXTENSION_OPERATE = FibonacciLevel._0236
  private readonly FIB_LOSS = FibonacciLevel._0786
  private readonly FIB_LEVEL_OPERATE = FibonacciLevel._050
  private readonly FIB_FIRST_LEVEL = FibonacciLevel._0236

  async update() {
    const mostRecentSetup = await this.setupRepository.findMostRecentStartedOrInOperation()

    if (!mostRecentSetup)
      throw Error(`Não foi encontrado nenhum setup com status ${Status.STARTED} ou ${Status.IN_OPERATION}`)

    const lastCandle = await this.candleService.getLastWithCurrentPrice(mostRecentSetup.asset, mostRecentSetup.interval)

    console.log(`Candle Atual: ${JSON.stringify(lastCandle)}`)

    mostRecentSetup.gainOrLossOrNothing(this.FIB_EXTENSION_OPERATE, this.FIB_LOSS, lastCandle.actualPrice)

    if (mostRecentSetup.status == Status.LOSS || mostRecentSetup.status == Status.GAIN) {
      this.setupCreatorUseCase.create({
        asset: mostRecentSetup.asset,
        candleToStart: mostRecentSetup.operation == OperationType.BUY ? mostRecentSetup.candleMax.endTime : mostRecentSetup.candleMin.endTime,
        interval: mostRecentSetup.interval
      })
      return
    }

    mostRecentSetup.analyze(this.FIB_FIRST_LEVEL, this.FIB_LEVEL_OPERATE, lastCandle)

    if (mostRecentSetup.imReadyToOperate()) {
      // enviar um evento para eventBridge com evento para iniciar operação
    }

    this.setupRepository.update(mostRecentSetup)
  }
}