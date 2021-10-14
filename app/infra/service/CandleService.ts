import { Inject, Service } from "typedi";
import { Candle } from "../../domain/Candle";
import { Asset } from "../../domain/enums/Asset";
import { Interval } from "../../domain/enums/Interval";
import axios from 'axios';
import { TickerService } from "./TickerService";

@Service()
export class CandleService {

    @Inject()
    private readonly tickerService: TickerService

    async getLastWithCurrentPrice(asset: Asset, interval: Interval): Promise<Candle> {
        return this.find({
            asset: asset,
            interval: interval,
            limit: 1,
            startTime: null
        }).then(async candles => {
            if (candles.length != 0) {
                const response = candles[0]
                response.actualPrice = await this.tickerService.getActualPrice(asset)
                return response
            }
        })
    }

    async find(request: GetCandleRequest): Promise<Candle[]> {
        let queryString = `?symbol=${request.asset}&limit=${request.limit}&interval=${request.interval}`

        if (request.startTime)
            queryString += `&startTime=${new Date(request.startTime).getTime()}`

        const response = await axios.get(`${process.env.BINANCE_URL}klines${queryString}`)

        if (response.status != 200) {
            const err = response.data as Promise<any>
            throw Error((await err).msg)
        }

        const data = response.data as Promise<String[][]>

        return (await data).map<Candle>(data => new Candle(Number(data[1]), Number(data[2]), Number(data[3]), Number(data[4]), Number(data[5]), Number(data[9]), Number(data[0]), Number(data[6]))
        )
    }
}

export class GetCandleRequest {
    asset: Asset
    startTime: Date
    interval: Interval
    limit: Number = 1
}