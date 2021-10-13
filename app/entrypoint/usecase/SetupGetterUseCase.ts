import { Inject, Service } from 'typedi';
import { SetupRepository } from '../../infra/dataprovider/SetupRepository';
import 'reflect-metadata';
import { Asset } from '../../domain/enums/Asset';
import { Interval } from '../../domain/enums/Interval';

@Service()
export class SetupGetterUseCase {

  @Inject()
  private readonly setupRepository: SetupRepository

  async getByAssetAndInterval(asset?: Asset, interval?: Interval) {    
    return await this.setupRepository.findMostRecentStartedOrInOperation(asset, interval)
  }
}