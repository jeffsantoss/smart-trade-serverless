import { Service } from "typedi";
import { Candle } from "../../domain/Candle";
import { Asset } from "../../domain/enums/Asset";
import { Interval } from "../../domain/enums/Interval";
import fetch from "node-fetch";

@Service()
export class CandleService {

    async find(request: GetCandleRequest): Promise<Candle[]> {
        const queryString = `?symbol=${request.asset}&limit=${request.limit}&interval=${request.interval}&startTime=${new Date(request.startTime).getTime()}`

        const response = await fetch(`${process.env.BINANCE_URL}klines${queryString}`)

        if (!response.ok) {
            const err = response.response.json() as Promise<any>
            throw Error((await err).msg)
        }

        const data = response.json() as Promise<String[][]>

        const candles = (await data).map<Candle>(data => (
            {
                openPrice: Number(data[1]),
                highPrice: Number(data[2]),
                lowPrice: Number(data[3]),
                closePrice: Number(data[4]),
                volumeOffered: Number(data[5]),
                operatedVolume: Number(data[9]),
                startTime: new Date(Number(data[0])),
                endTime: new Date(Number(data[6]))        
            }
        ))

        return candles
    }
}

export class GetCandleRequest {
    asset: Asset
    startTime: Date
    interval: Interval
    limit: Number = 1   
}