import { Candle } from "../../domain/Candle";

export class CandleService {

    async get(startTime: ): Promise<Candle> {
        const response = await fetch(`${process.env.BINANCE_URL}/klines}`)

        if (!response.ok)
            throw Error("Falha ao obter candles")

        const data = response.json() as Promise<String[][]>

        const candles = (await data).map<Candle>(data => (
            {
                openPrice: data[0] as Number
            }
        ))
    }
}