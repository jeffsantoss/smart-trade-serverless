import { Inject, Service } from 'typedi';
import { Status } from '../../domain/enums/Status';
import { SetupRepository } from '../../infra/dataprovider/SetupRepository';
import { SetupRequest } from '../request/SetupRequest';
import { v4 as uuidv4 } from 'uuid';
import 'reflect-metadata';
import { CandleService } from '../../infra/service/CandleService';
import { Graphic } from '../../domain/Graphic';
import { TickerService } from '../../infra/service/TickerService';
import { FibonacciLevel } from '../../domain/enums/FibonacciLevel';
import { SetupCreatorUseCase } from './SetupCreatorUseCase';
import { OperationType } from '../../domain/enums/OperationType';

@Service()
export class SetupUpdaterUseCase {

  @Inject()
  private readonly setupRepository: SetupRepository

  @Inject()
  private readonly setupCreatorUseCase: SetupCreatorUseCase

  @Inject()
  private readonly tikerService: TickerService

  private readonly FIB_EXTENSION_OPERATE = FibonacciLevel._0236
  private readonly FIB_LOSS = FibonacciLevel._0786
  private readonly FIB_LEVEL_OPERATE = FibonacciLevel._050
  private readonly FIRST_FIB_LEVEL = FibonacciLevel._0236

  async update(request: SetupRequest) {
    console.log(`Request: ${JSON.stringify(request)}`)

    const mostRecentSetup = await this.setupRepository.findMostRecentStartedOrInOperation()

    if (!mostRecentSetup)
      throw Error(`Não foi encontrado nenhum setup com status ${Status.STARTED} ou ${Status.IN_OPERATION}`)

    const actualPrice = await this.tikerService.getActualPrice(mostRecentSetup.asset)

    mostRecentSetup.gainOrLossOrNothing(this.FIB_EXTENSION_OPERATE, this.FIB_LOSS, actualPrice)

    if (mostRecentSetup.status == Status.LOSS || mostRecentSetup.status == Status.GAIN) {
      this.setupCreatorUseCase.create({
        asset: mostRecentSetup.asset,
        candleToStart: mostRecentSetup.operation == OperationType.BUY ? mostRecentSetup.candleMax.endTime : mostRecentSetup.candleMin.endTime,
        interval: mostRecentSetup.interval
      })
      return
    }


    if (mostRecentSetup.breakupOnFibLevel(this.FIRST_FIB_LEVEL, actualPrice)) {
      console.log(`Preço ${actualPrice} rompeu a fib no nível ${this.FIRST_FIB_LEVEL} para operação de ${mostRecentSetup.operation}`)
      mostRecentSetup.breakupAnyFib = true
    } else if (mostRecentSetup.correctedOnFibLevel(this.FIRST_FIB_LEVEL, actualPrice)) {
      console.log(`Preço ${actualPrice} rompeu a fib no nível ${this.FIRST_FIB_LEVEL} para operação de ${mostRecentSetup.operation}`)
      mostRecentSetup.correctionAnyFib = true
    } else if (mostRecentSetup.breakupOnFibLevel(this.FIB_LEVEL_OPERATE, actualPrice)) {
      console.log(`Preço ${actualPrice} rompeu a fib no nível ${this.FIB_LEVEL_OPERATE} para operação de ${mostRecentSetup.operation}`)
      mostRecentSetup.breakup = true
    } else if (mostRecentSetup.correctedOnFibLevel(this.FIB_LEVEL_OPERATE, actualPrice)) {
      console.log(`Preço ${actualPrice} corrigu a fib no nível ${this.FIB_LEVEL_OPERATE} para operação de ${mostRecentSetup.operation}`)
      mostRecentSetup.corrected = true
    }

    if (mostRecentSetup.imReadyToOperate()) {
      // enviar um evento para eventBridge com evento para iniciar operação
    }

    this.setupRepository.update(mostRecentSetup)
  }
}