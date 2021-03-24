import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class HighLevelApi implements ICredentialType {
	name = 'highLevelApi';
	displayName = 'HighLevel API';
	documentationUrl = 'highLevel';
	properties = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
	];
}