import type {
  ICredentialType,
  INodeProperties,
  ICredentialsDecrypted,
  INodeCredentialTestResult,
  ICredentialDataDecryptedObject,
  IHttpRequestOptions,
  ICredentialTestRequest,
} from 'n8n-workflow';

console.log('=== CloudBlueConnectSimpleApi Credentials Loading ===');

export class CloudBlueConnectSimpleApi implements ICredentialType {
  name = 'cloudBlueConnectSimpleApi';
  displayName = 'CloudBlue Connect Simple API';
  documentationUrl = 'https://connect.cloudblue.com/community/sdk/connect/';

  constructor() {
    console.log('=== CloudBlueConnectSimpleApi Credentials Constructor Called ===');
  }

  properties: INodeProperties[] = [
    {
      displayName: 'API URL',
      name: 'apiUrl',
      type: 'string',
      default: '',
      required: true,
      placeholder: 'https://api.example.com',
      description: 'The URL of the CloudBlue Connect Simple API',
    },
    {
      displayName: 'Username',
      name: 'username',
      type: 'string',
      default: '',
      required: true,
      description: 'The username for Basic Authentication',
    },
    {
      displayName: 'Password',
      name: 'password',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'The password for Basic Authentication',
    },
    {
      displayName: 'Subscription Key',
      name: 'subscriptionKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description:
        "The ID of your reseller's subscription on the API gateway that defines restrictions on your API calls",
    },
    {
      displayName: 'Marketplace',
      name: 'marketplace',
      type: 'string',
      default: '',
      required: true,
      description: 'The marketplace code (e.g., "us" for United States, "uk" for United Kingdom)',
      placeholder: 'us',
    },
    {
      displayName: 'Enable Cache',
      name: 'enableCache',
      type: 'boolean',
      default: false,
      description:
        'Whether to enable response caching. Cache is automatically invalidated when related resources are created, updated, or deleted.',
    },
    {
      displayName: 'Cache TTL (seconds)',
      name: 'cacheTTL',
      type: 'number',
      default: 300,
      description: 'Time to live for cached responses in seconds. Only GET requests are cached.',
      displayOptions: {
        show: {
          enableCache: [true],
        },
      },
    },
    {
      displayName: 'Cache Size',
      name: 'cacheSize',
      type: 'number',
      default: 500,
      description: 'Maximum number of responses to cache',
      displayOptions: {
        show: {
          enableCache: [true],
        },
      },
    },
  ];

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.apiUrl}}',
      url: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          '={{`Basic ${Buffer.from(`${$credentials.username}:${$credentials.password}`).toString("base64")}`}}',
        'X-Subscription-Key': '={{$credentials.subscriptionKey}}',
      },
      body: {
        marketplace: '={{$credentials.marketplace}}',
      },
    },
  };

  async authenticate(
    credentials: ICredentialDataDecryptedObject,
    requestOptions: IHttpRequestOptions,
  ): Promise<IHttpRequestOptions> {
    console.log('=== CloudBlueConnectSimpleApi Authenticate Called ===');
    console.log('Base URL:', credentials.apiUrl);
    console.log('Request URL:', requestOptions.url);
    console.log('Full URL:', `${credentials.apiUrl}${requestOptions.url}`);
    console.log('Request Method:', requestOptions.method);
    console.log('Request Headers:', Object.keys(requestOptions.headers || {}));
    console.log('Has Username:', !!credentials.username);
    console.log('Has Password:', !!credentials.password);
    console.log('Has Subscription Key:', !!credentials.subscriptionKey);
    console.log('Has Marketplace:', !!credentials.marketplace);
    console.log('Request Body:', requestOptions.body);
    return requestOptions;
  }
}
