import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class CloudBlueConnectSimpleApi implements ICredentialType {
  name = 'cloudBlueConnectSimpleApi';
  displayName = 'CloudBlue Connect Simple API';
  documentationUrl = 'https://connect.cloudblue.com/community/sdk/connect/';

  properties: INodeProperties[] = [
    {
      displayName: 'Auth URL',
      name: 'authUrl',
      type: 'string',
      default: '',
      description: 'The URL of the CloudBlue Connect Simple API authentication endpoint',
      required: true,
      placeholder: 'https://api.example.com/auth',
    },
    {
      displayName: 'API URL',
      name: 'apiUrl',
      type: 'string',
      default: '',
      description:
        'The URL of the CloudBlue Connect Simple API service API for making actual API calls',
      required: true,
      placeholder: 'https://api.example.com',
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
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
      required: true,
      description: 'The client ID for OAuth2 authentication',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'The client secret for OAuth2 authentication',
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
    {
      displayName: 'Enable Debug Logging',
      name: 'enableDebug',
      type: 'boolean',
      default: false,
      description: 'Whether to enable debug logging of API requests and responses',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.authUrl}}',
      url: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      body: {
        grant_type: 'password',
        username: '={{$credentials.username}}',
        password: '={{$credentials.password}}',
        client_id: '={{$credentials.clientId}}',
        client_secret: '={{$credentials.clientSecret}}',
        scope: 'openid',
      },
    },
    rules: [
      {
        type: 'responseSuccessBody',
        properties: {
          key: 'access_token',
          value: '{{typeof $response.access_token === "string"}}',
          message: 'Invalid token response',
        },
      },
    ],
  };
}
