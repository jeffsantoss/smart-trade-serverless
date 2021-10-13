import { Service } from "typedi";
import axios from 'axios';
import { Order } from "../../domain/Order";
import CryptoJS from 'crypto-js';
import { OperationType } from "../../domain/enums/OperationType";

@Service()
export class OrderService {

    async create(order: Order): Promise<OrderResponse> {
        const side = order.operation == OperationType.BUY ? "BUY" : "SELL"

        const queryString = `symbol=${order.asset}&side=${side}&type=${order.type}&timeInForce=GTC&quantity=${order.quantity}&price=${order.currentPrice}&timestamp=${Date.now()}`

        const config = {
            headers: {
                "X-MBX-APIKEY": process.env.BINANCE_API_KEY,
            }
        }
        try {
            const response = await axios.post(`${process.env.BINANCE_URL}order?${queryString}&signature=${this.buildSignature(queryString)}`, null ,config)

            console.log(`Response: ${JSON.stringify(response)}`)

            if (response.status != 200) {
                const err = response.data as Promise<any>
                throw Error((await err).msg)
            }

            return response.data as Promise<OrderResponse>
        } catch(err) {
            console.log(err)
            const errData = err.response.data as Promise<any>
            throw Error((await errData).msg)
        }
    }

    private buildSignature(queryString: string) {
        return CryptoJS.HmacSHA256(queryString, process.env.BINANCE_API_SECRET).toString();
    }
}

export class OrderResponse {
    orderId: string
    clientOrderId: string
}