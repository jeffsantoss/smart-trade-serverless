import { Handler, Context } from 'aws-lambda';
import Container from 'typedi';
import { SetupCreatorUseCase } from './entrypoint/usecase/SetupCreatorUseCase';
import { SetupAnalyzerUseCase } from './entrypoint/usecase/SetupAnalyzerUseCase';
import { OrderCreatorUseCase } from './entrypoint/usecase/OrderCreatorUseCase';
import { SetupGetterUseCase } from './entrypoint/usecase/SetupGetterUseCase';


const setupCreatorUseCase = Container.get<SetupCreatorUseCase>(SetupCreatorUseCase)
const setupUpdaterUseCase = Container.get<SetupAnalyzerUseCase>(SetupAnalyzerUseCase)
const setupGetterUseCase = Container.get<SetupGetterUseCase>(SetupGetterUseCase)
const orderCreatorUseCase = Container.get<OrderCreatorUseCase>(OrderCreatorUseCase)


export const setupCreator: Handler = (event: any, context: Context) => {
  console.log(`Function Name: ${context.functionName}`)
  console.log(`Event: ${JSON.stringify(event)}`)

  return setupCreatorUseCase.create(JSON.parse(JSON.stringify(event)))
};

export const setupAnalyze: Handler = (event: any, context: Context) => {
  console.log(`Function Name: ${context.functionName}`)
  console.log(`Event: ${JSON.stringify(event)}`)

  return setupUpdaterUseCase.analyze(event.asset, event.interval).then()
};

export const setupGetter: Handler = async (event: any, context: Context) => {
  console.log(`Function Name: ${context.functionName}`)
  console.log(`Event: ${JSON.stringify(event)}`)

  const result = await setupGetterUseCase.getByAssetAndInterval(event.queryStringParameters.asset, event.queryStringParameters.interval)

 return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};

export const createOrder: Handler = (event: any, context: Context) => {
  console.log(`Function Name: ${context.functionName}`)
  console.log(`Event: ${JSON.stringify(event)}`)

  return orderCreatorUseCase.createBySetup(JSON.parse(JSON.stringify(event)))
};