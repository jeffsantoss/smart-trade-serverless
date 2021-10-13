import { Asset } from '../../domain/enums/Asset';
import { Interval } from '../../domain/enums/Interval';

export class CreateSetupRequest {    
    asset: Asset
    interval: Interval
    candleToStart: Date
}