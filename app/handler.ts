import { Handler, Context } from 'aws-lambda';
import Container from 'typedi';
import { SetupCreatorUseCase } from './entrypoint/usecase/SetupCreatorUseCase';
import { SetupAnalyzerUseCase } from './entrypoint/usecase/SetupAnalyzerUseCase';
import { OrderCreatorUseCase } from './entrypoint/usecase/OrderCreatorUseCase';


const setupCreatorUseCase = Container.get<SetupCreatorUseCase>(SetupCreatorUseCase)
const setupUpdaterUseCase = Container.get<SetupAnalyzerUseCase>(SetupAnalyzerUseCase)
const orderCreatorUseCase = Container.get<OrderCreatorUseCase>(OrderCreatorUseCase)


export const setupCreator: Handler = (event: any, context: Context) => {  
  console.log(`Function Name: ${context.functionName}`)
  console.log(`Event: ${JSON.stringify(event)}`)

  return setupCreatorUseCase.create(JSON.parse(JSON.stringify(event)))
};

export const setupAnalyze: Handler = (event: any, context: Context) => {  
  console.log(`Function Name: ${context.functionName}`)
  console.log(`Event: ${JSON.stringify(event)}`)

  return setupUpdaterUseCase.analyze(event.asset, event.interval)
};

export const createOrder: Handler = (event: any, context: Context) => {  
  console.log(`Function Name: ${context.functionName}`)
  console.log(`Event: ${JSON.stringify(event)}`)

  return orderCreatorUseCase.createBySetup(JSON.parse(JSON.stringify(event)))
};