import { Service } from 'typedi';
import AWS from 'aws-sdk';
import { Setup } from '../../domain/Setup';

@Service()
export class SetupRepository {
  
  async create(entity: Setup) : Promise<Setup> {
    const params = {
      TableName: process.env.SMART_TRADE_SETUP_TABLE,
      Item: entity,
    };

    await this.getDynamoClient().put(params).promise()

    return entity
  }

  async findById(uuid: string) : Promise<Setup> {
    const params = {
      TableName: process.env.SMART_TRADE_SETUP_TABLE,
      Key: {
         id: uuid
      }
    };

    const item = (await this.getDynamoClient().get(params).promise()).Item

    return JSON.parse(JSON.stringify(item))
  }

  private getDynamoClient() {
    return new AWS.DynamoDB.DocumentClient()
  }
}