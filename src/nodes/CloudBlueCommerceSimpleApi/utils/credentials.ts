import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { CloudBlueApiService } from '../services/CloudBlueApiService';

type CredentialsFunctions = IExecuteFunctions | ILoadOptionsFunctions;

export const initializeApiService = async (
  executeFunctions: CredentialsFunctions,
): Promise<CloudBlueApiService> => {
  const credentials = await executeFunctions.getCredentials('cloudBlueCommerceSimpleApi');

  return CloudBlueApiService.getInstance(
    credentials.apiUrl as string,
    credentials.authUrl as string,
    credentials.username as string,
    credentials.password as string,
    credentials.clientId as string,
    credentials.clientSecret as string,
    credentials.subscriptionKey as string,
  );
};
