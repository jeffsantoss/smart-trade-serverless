import { Handler, Context } from 'aws-lambda';
import Container from 'typedi';
import { SetupCreatorUseCase } from './entrypoint/usecase/SetupCreatorUseCase';
import { SetupUpdaterUseCase } from './entrypoint/usecase/SetupUpdaterUseCase';


const setupCreatorUseCase = Container.get<SetupCreatorUseCase>(SetupCreatorUseCase)
const setupUpdaterUseCase = Container.get<SetupUpdaterUseCase>(SetupUpdaterUseCase)


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