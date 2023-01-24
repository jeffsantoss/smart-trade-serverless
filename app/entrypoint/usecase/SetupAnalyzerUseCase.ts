import { Inject, Service } from 'typedi';
import { Status } from '../../domain/enums/Status';
import { SetupRepository } from '../../infra/dataprovider/SetupRepository';
import 'reflect-metadata';
import { OperationType } from '../../domain/enums/OperationType';
import { CandleService } from '../../infra/service/CandleService';
import { Asset } from '../../domain/enums/Asset';
import AWS from 'aws-sdk';
import { Interval } from '../../domain/enums/Interval';
import { OrderCreatorUseCase } from './OrderCreatorUseCase';
import { FIB_LEVEL_GAIN, FIB_FIRST_LEVEL, FIB_LEVEL_BREAK_CORRECTION_OPERATE, FIB_LEVEL_OPERATE, FIB_LOSS } from '../../domain/Contants';

@Service()
export class SetupAnalyzerUseCase {

  @Inject()
  private readonly setupRepository: SetupRepository

  @Inject()
  private readonly candleService: CandleService

  @Inject()
  private readonly orderCreatorUseCase: OrderCreatorUseCase



  async analyze(asset: Asset, interval: Interval) {
    const mostRecentSetup = await this.setupRepository.findMostRecentStartedOrInOperation(asset, interval)

    if (!mostRecentSetup)
      throw Error(`Não foi encontrado nenhum setup com status ${Status.STARTED} ou ${Status.IN_OPERATION}`)

    const lastCandle = await this.candleService.getLastWithCurrentPrice(mostRecentSetup.asset, mostRecentSetup.interval)

    const ocurredGainOrLoss = mostRecentSetup.ocurredGainOrLoss(FIB_LEVEL_GAIN, FIB_LOSS, lastCandle.actualPrice)

    if (ocurredGainOrLoss) {
      this.setupRepository.update(mostRecentSetup)

      const json = {
        asset: mostRecentSetup.asset,
        candleToStart: mostRecentSetup.operation == OperationType.BUY ? mostRecentSetup.candleMax.endTime : mostRecentSetup.candleMin.endTime,
        interval: mostRecentSetup.interval
      }

      new AWS.EventBridge().putEvents({
        Entries: [
          {
            EventBusName: process.env.SMART_TRADE_EVENT_BUS,
            Source: 'setup.analyze',
            DetailType: 'operationFinished',
            Detail: JSON.stringify(json)
          }
        ]
      })

      return
    }

    const ocurredEventOnFib = mostRecentSetup.occurredEventOnFib(FIB_FIRST_LEVEL, FIB_LEVEL_BREAK_CORRECTION_OPERATE, FIB_LEVEL_OPERATE, lastCandle)

    if (mostRecentSetup.imReadyToOperate()) {

      mostRecentSetup.status = Status.IN_OPERATION

      this.orderCreatorUseCase.createBySetup(mostRecentSetup)            
    }

    if (ocurredEventOnFib) {
      this.setupRepository.update(mostRecentSetup)
    }
  }
}