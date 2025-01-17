import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class CloudBlueCommerceSimpleApi implements ICredentialType {
  name = 'cloudBlueCommerceSimpleApi';
  displayName = 'CloudBlue Commerce SimpleAPI';
  documentationUrl =
    'https://docs.cloudblue.com/cbc/21.0/Simple-API/how-to-use/spec/#tag/User-Authentication';

  properties: INodeProperties[] = [
    {
      displayName: 'Auth URL',
      name: 'authUrl',
      type: 'string',
      default: '',
      description: 'The URL of the CloudBlue Commerce SimpleAPI authentication endpoint',
      required: true,
      placeholder: 'https://[your fqdn]]/auth/realms/[your sr number]]/protocol/openid-connect',
    },
    {
      displayName: 'API URL',
      name: 'apiUrl',
      type: 'string',
      default: 'https://simpleapiprod.azure-api.net/marketplace',
      description:
        'The URL of the CloudBlue Commerce SimpleAPI service API for making actual API calls',
      required: true,
      placeholder: 'https://simpleapiprod.azure-api.net/marketplace',
    },
    {
      displayName: 'Username',
      name: 'username',
      type: 'string',
      default: '',
      required: true,
      description: 'The username from your CloudBlue Commerce > MarketplaceAPI',
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
      description: 'The password for your MarketplaceAPI user (from classic panel > users)',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
      required: true,
      description: 'The client ID for OAuth2 authentication from your CloudBlue account manager.',
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
      description:
        'The client secret for OAuth2 authentication from your CloudBlue account manager.',
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
      description: 'Password from your CloudBlue Commerce > MarketplaceAPI',
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
