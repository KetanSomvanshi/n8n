import {
	OptionsWithUri,
} from 'request';

import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-core';
import {
	ICredentialDataDecryptedObject,
	IDataObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import {
	ICouponLine,
	IFeeLine,
	ILineItem,
	IShoppingLine,
} from './OrderInterface';

import {
	createHash,
} from 'crypto';

import {
	snakeCase,
} from 'change-case';

export async function woocommerceApiRequest(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IWebhookFunctions, method: string, resource: string, body: any = {}, qs: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const credentials = await this.getCredentials('wooCommerceApi');
	if (credentials === undefined) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}
	let options: OptionsWithUri = {
		auth: {
			user: credentials.consumerKey as string,
			password: credentials.consumerSecret as string,
		},
		method,
		qs,
		body,
		uri: uri || `${credentials.url}/wp-json/wc/v3${resource}`,
		json: true,
	};
	if (!Object.keys(body).length) {
		delete options.form;
	}
	options = Object.assign({}, options, option);

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function woocommerceApiRequestAllItems(this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions, method: string, endpoint: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;
	let uri: string | undefined;
	query.per_page = 100;
	do {
		responseData = await woocommerceApiRequest.call(this, method, endpoint, body, query, uri, { resolveWithFullResponse: true });
		uri = responseData.headers['link'].split(';')[0].replace('<', '').replace('>', '');
		returnData.push.apply(returnData, responseData.body);
	} while (
		responseData.headers['link'] !== undefined &&
		responseData.headers['link'].includes('rel="next"')
	);

	return returnData;
}

/**
 * Creates a secret from the credentials
 *
 * @export
 * @param {ICredentialDataDecryptedObject} credentials
 * @returns
 */
export function getAutomaticSecret(credentials: ICredentialDataDecryptedObject) {
	const data = `${credentials.consumerKey},${credentials.consumerSecret}`;
	return createHash('md5').update(data).digest('hex');
}

export function setMetadata(data:
	IShoppingLine[] |
	IShoppingLine[] |
	IFeeLine[] |
	ILineItem[] |
	ICouponLine[]) {
	for (let i = 0; i < data.length; i++) {
		//@ts-ignore\
		if (data[i].metadataUi && data[i].metadataUi.metadataValues) {
			//@ts-ignore
			data[i].meta_data = data[i].metadataUi.metadataValues;
			//@ts-ignore
			delete data[i].metadataUi;
		} else {
			//@ts-ignore
			delete data[i].metadataUi;
		}
	}
}

export function toSnakeCase(data:
	IShoppingLine[] |
	IShoppingLine[] |
	IFeeLine[] |
	ILineItem[] |
	ICouponLine[] |
	IDataObject) {
	if (!Array.isArray(data)) {
		data = [data];
	}
	let remove = false;
	for (let i = 0; i < data.length; i++) {
		for (const key of Object.keys(data[i])) {
			//@ts-ignore
			if (data[i][snakeCase(key)] === undefined) {
				remove = true;
			}
			//@ts-ignore
			data[i][snakeCase(key)] = data[i][key];
			if (remove) {
				//@ts-ignore
				delete data[i][key];
				remove = false;
			}
		}
	}
}
