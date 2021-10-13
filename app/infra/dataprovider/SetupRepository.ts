import { Service } from 'typedi';
import AWS from 'aws-sdk';
import { Setup } from '../../domain/Setup';
import { Status } from '../../domain/enums/Status';
import { Asset } from '../../domain/enums/Asset';
import { Interval } from '../../domain/enums/Interval';

@Service()
export class SetupRepository {

  async create(entity: Setup): Promise<Setup> {
    const params = {
      TableName: process.env.SMART_TRADE_SETUP_TABLE,
      Item: entity,
    };

    await this.getDynamoClient().put(params).promise()

    console.log(`Item adicionado: ${JSON.stringify(entity)}`)

    return entity
  }

  async findMostRecentStartedOrInOperation(asset: Asset, interval: Interval): Promise<Setup> {
    const params = {
      TableName: process.env.SMART_TRADE_SETUP_TABLE,
      FilterExpression: "#status = :started OR #status = :in_operation AND #asset = :asset AND #interval = :interval",
      ExpressionAttributeNames: {
        "#status": "status",
        "#asset": "asset",
        "#interval": "interval"
      },
      ExpressionAttributeValues: {
        ":started": Status.STARTED,
        ":in_operation": Status.IN_OPERATION,
        ":asset": asset,
        ":interval": interval
      },
    };

    const itens = (await this.getDynamoClient().scan(params).promise()).Items

    console.log(`Itens encontrados com status ${Status.STARTED} e ${Status.IN_OPERATION}: ${JSON.stringify(itens)}`)

    const mostRecent = itens.reduce((a, b) => {
      return new Date(a.createdAt) > new Date(b.createdAt) ? a : b;
    });

    console.log(`Último Setup encontrado: ${JSON.stringify(mostRecent)}`)

    const json: Setup = JSON.parse(JSON.stringify(mostRecent))

    return new Setup(json.id, json.asset, json.interval, json.candleMax, json.candleMin, json.operation, json.status, json.breakup, json.corrected, json.breakupAnyFib, json.correctedAnyFib, json.fiboRetracements, json.fiboExtensions, json.createdAt)
  }

  async update(entity: Setup) {
    const params = {
      TableName: process.env.SMART_TRADE_SETUP_TABLE,
      Key: {
        id: entity.id
      },
      ExpressionAttributeValues: {},
      ExpressionAttributeNames: {},
      UpdateExpression: "",
      ReturnValues: "UPDATED_NEW"
    }

    console.log(`Atualizando setup para: ${JSON.stringify(entity)}`)

    let prefix = "set ";
    let attributes = Object.keys(entity);
    for (let i = 0; i < attributes.length; i++) {
      let attribute = attributes[i];
      if (attribute != "id") {
        params["UpdateExpression"] += prefix + "#" + attribute + " = :" + attribute;
        params["ExpressionAttributeValues"][":" + attribute] = entity[attribute];
        params["ExpressionAttributeNames"]["#" + attribute] = attribute;
        prefix = ", ";
      }
    }
    return await this.getDynamoClient().update(params).promise();
  }

  private getDynamoClient() {
    return new AWS.DynamoDB.DocumentClient()
  }
}