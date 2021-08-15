import { UserSettings } from 'n8n-core';
import { Command, flags } from '@oclif/command';

import { buildFiles, IBuildOptions } from '../src';

export class Build extends Command {
	static description = 'Builds credentials and nodes and copies it to n8n custom extension folder';

	static examples = [
		`$ n8n-node-dev build`,
		`$ n8n-node-dev build --destination ~/n8n-nodes`,
		`$ n8n-node-dev build --watch`,
	];

	static flags = {
		help: flags.help({ char: 'h' }),
		destination: flags.string({
			char: 'd',
			description: `The path to copy the compiles files to [default: ${UserSettings.getUserN8nFolderCustomExtensionPath()}]`,
		}),
		watch: flags.boolean({
			description:
				'Starts in watch mode and automatically builds and copies file whenever they change',
		}),
	};

	async run() {
		const { flags } = this.parse(Build);

		this.log('\nBuild credentials and nodes');
		this.log('=========================');

		try {
			const options: IBuildOptions = {};

			if (flags.destination) {
				options.destinationFolder = flags.destination;
			}
			if (flags.watch) {
				options.watch = true;
			}

			const outputDirectory = await buildFiles(options);

			this.log(`The nodes got build and saved into the following folder:\n${outputDirectory}`);
		} catch (error) {
			this.log(`\nGOT ERROR: "${error.message}"`);
			this.log('====================================');
			this.log(error.stack);
		}
	}
}
