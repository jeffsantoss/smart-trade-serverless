import { Service } from 'typedi';
import AWS from 'aws-sdk';
import { Setup } from '../../domain/Setup';
import { Status } from '../../domain/enums/Status';

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

  async findMostRecentStartedOrInOperation(): Promise<Setup> {
    const params = {
      TableName: process.env.SMART_TRADE_SETUP_TABLE,
      KeyConditionExpression: "#status = :started or #status = :in_operation",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":started": Status.STARTED,
        ":in_operation": Status.IN_OPERATION
      },
    };

    const itens = (await this.getDynamoClient().query(params).promise()).Items

    const mostRecent = itens.reduce((a, b) => {
      return new Date(a.createdAt) > new Date(b.createdAt) ? a : b;
    });

    console.log(`Último Setup encontrado: ${JSON.stringify(mostRecent)}`)

    return JSON.parse(JSON.stringify(mostRecent))
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