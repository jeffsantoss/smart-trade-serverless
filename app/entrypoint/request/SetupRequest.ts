import { Asset } from '../../domain/enums/Asset';
import { Interval } from '../../domain/enums/Interval';

export class SetupRequest {    
    asset: Asset
    interval: Interval
    candleToStart: Date
}