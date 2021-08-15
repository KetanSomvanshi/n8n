import { Command, flags } from '@oclif/command';

import { IDataObject } from 'n8n-workflow';

import { Db } from '../../src';

export class ListWorkflowCommand extends Command {
	static description = '\nList workflows';

	static examples = [
		'$ n8n list:workflow',
		'$ n8n list:workflow --active=true --onlyId',
		'$ n8n list:workflow --active=false',
	];

	static flags = {
		help: flags.help({ char: 'h' }),
		active: flags.string({
			description: 'Filters workflows by active status. Can be true or false',
		}),
		onlyId: flags.boolean({
			description: 'Outputs workflow IDs only, one per line.',
		}),
	};

	async run() {
		const { flags } = this.parse(ListWorkflowCommand);

		if (flags.active !== undefined && !['true', 'false'].includes(flags.active)) {
			this.error('The --active flag has to be passed using true or false');
		}

		try {
			await Db.init();

			const findQuery: IDataObject = {};
			if (flags.active !== undefined) {
				findQuery.active = flags.active === 'true';
			}

			const workflows = await Db.collections.Workflow!.find(findQuery);
			if (flags.onlyId) {
				workflows.forEach((workflow) => console.log(workflow.id));
			} else {
				workflows.forEach((workflow) => console.log(`${workflow.id}|${workflow.name}`));
			}
		} catch (error) {
			console.error('\nGOT ERROR');
			console.log('====================================');
			console.error(error.message);
			console.error(error.stack);
			this.exit(1);
		}

		this.exit();
	}
}
