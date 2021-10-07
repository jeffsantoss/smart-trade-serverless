import { Service } from "typedi";
import { Asset } from "../../domain/enums/Asset";
import axios from 'axios';

@Service()
export class TickerService {

    async getActualPrice(asset: Asset): Promise<number> {
        const queryString = `?symbol=${asset}`

        const response = await axios.get(`${process.env.BINANCE_URL}ticker/price${queryString}`)

        if (response.status != 200) {
            const err = response.data as Promise<any>
            throw Error((await err).msg)
        }

        return await response.data.price
    }
}