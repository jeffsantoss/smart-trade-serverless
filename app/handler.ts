import { Handler, Context } from 'aws-lambda';
import Container from 'typedi';
import { SetupCreatorUseCase } from './entrypoint/usecase/SetupCreatorUseCase';


const setupCreatorUseCase = Container.get<SetupCreatorUseCase>(SetupCreatorUseCase)

export const setupCreator: Handler = (event: any, context: Context) => {  
  console.log(`Function Name: ${context.functionName}`)
  console.log(`Event: ${JSON.stringify(event)}`)

  return setupCreatorUseCase.create(JSON.parse(JSON.stringify(event.body)))
};