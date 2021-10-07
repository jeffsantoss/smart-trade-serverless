import { Service } from "typedi";
import { Asset } from "../../domain/enums/Asset";
import fetch from "node-fetch";

@Service()
export class TickerService {

    async getActualPrice(asset: Asset): Promise<number> {
        const queryString = `?symbol=${asset}`

        const response = await fetch(`${process.env.BINANCE_URL}ticker/price${queryString}`)

        if (!response.ok) {
            const err = response.response.json() as Promise<any>
            throw Error((await err).msg)
        }

        return await response.json().price
    }
}