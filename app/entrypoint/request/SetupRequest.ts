import { Asset } from '../../domain/enums/Asset';

export class SetupRequest {    
    asset: Asset
    candleToStart: Date
}