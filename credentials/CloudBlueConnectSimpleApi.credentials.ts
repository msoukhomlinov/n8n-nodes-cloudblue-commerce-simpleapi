import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CloudBlueConnectSimpleApi implements ICredentialType {
	name = 'cloudBlueConnectSimpleApi';
	displayName = 'CloudBlue Connect Simple API';
	documentationUrl = 'https://docs.cloudblue.com/cbc/21.0/Simple-API/how-to-use/howto/';
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
			description: 'The ID of your reseller\'s subscription on the API gateway that defines restrictions on your API calls',
		},
		{
			displayName: 'Enable Cache',
			name: 'enableCache',
			type: 'boolean',
			default: false,
			description: 'Whether to enable response caching. Cache is automatically invalidated when related resources are created, updated, or deleted.',
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

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl}}',
			url: '/token',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': '={{`Basic ${Buffer.from(`${$credentials.username}:${$credentials.password}`).toString("base64")}`}}',
				'X-Subscription-Key': '={{$credentials.subscriptionKey}}',
			},
			body: {
				marketplace: 'us'
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'token',
					value: '{{typeof $response.token === "string"}}',
					message: 'Invalid token response',
				},
			},
		],
	};
} 