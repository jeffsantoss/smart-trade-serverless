import { Inject, Service } from 'typedi';
import { Candle } from '../../domain/Candle';
import { OperationType } from '../../domain/enums/OperationType';
import { Status } from '../../domain/enums/Status';
import { SetupRepository } from '../../infra/dataprovider/SetupRepository';
import { SetupRequest } from '../request/SetupRequest';
import { v4 as uuidv4 } from 'uuid';
import 'reflect-metadata';

@Service()
export class SetupCreatorUseCase {

  @Inject()
  private readonly setupRepository: SetupRepository

  async create(request: SetupRequest) {
    console.log(`Request: ${JSON.stringify(request)}`)

    const setup = await this.setupRepository.create({
      id: uuidv4(),
      breakup: false,
      breakupAnyFib: false,
      correctionAnyFib: false,
      status: Status.RUNNING,
      operation: OperationType.BUY,
      asset: request.asset,
      candleMax: new Candle(),
      candleMin: new Candle(),
      fiboExtensions: [],
      fiboRetracements: []
    })

    this.setupRepository.create(setup)
  }
}