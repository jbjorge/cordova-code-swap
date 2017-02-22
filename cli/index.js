#!/usr/bin/env node

/* eslint-env node */
/* eslint no-console: "off" */
/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */

const program = require('commander');
const createCCSFiles = require('../utils').createCCSFiles;
const cliDescription =
	`This is the CLI to create chcp.manifest files from your codebase.
  Supports comma separated glob for input and a folder as output.`;
const figlet = require('figlet');
const chalk = require('chalk');
const configureUrl = require('../utils/configureUrl');

program
	.description(cliDescription)
	.usage('-i <glob> -o <folder> [options]')
	.option('-i, --input <glob>', 'comma separated files to include in manifest', args => args.split(','))
	.option('-o, --output <folder>', 'folder to create the manifest file in')
	.option('-r, --replace <a,b>', 'replace "a" with "b" in the manifest file paths', args => args.split(','))
	.option('-c, --config <JSON>', 'a stringified JSON-object that will be merged with the generated chcp.json')
	.option('-d, --dev <ip[:port]>', 'watch files and update manifest automatically, starts a static file server that the app can fetch updates from')
	.option('-a, --autoUpdate', 'tell the app to update when the manifest updates')
	.parse(process.argv);

validateInput(program);

figlet(program.dev ? 'CCS dev' : 'CCS production', (err, data) => {
	console.log(data);
	const ccsOptions = {
		config: program.config,
		dev: program.dev,
		replace: program.replace,
		autoUpdate: program.autoUpdate
	};

	createCCSFiles(program.input, program.output, ccsOptions)
		.then(emitUpdateNotification => {
			if (program.dev && !program.autoUpdate) {
				console.log(chalk.blue('[CCS]: Force the app to update by typing "re" in this terminal'));
				const readline = require('readline');
				const rl = readline.createInterface({ input: process.stdin });
				rl.on('line', input => {
					if (input == 're') {
						emitUpdateNotification();
					}
				});
			}
			if (program.dev) {
				console.log(chalk.green(`Initialize CCS by ccs.initialize({ debug: { reloadServer: ${configureUrl(program.dev)} } }) to make the app reload automatically.`));
			} else {
				console.log(chalk.green('Generation of CCS files done.'));
			}
		})
		.catch(err => {
			console.error(err);
			process.exit(1);
		});
});

function validateInput(program) {
	if (!program.input && !program.output) {
		console.log(chalk.red('  Missing arguments: --input and --output'));
		showHelpAndExit();
	} else if (!program.input) {
		console.log(chalk.red('  Missing argument: --input'));
		showHelpAndExit(1);
	} else if (!program.output) {
		console.log(chalk.red('  Missing argument: --output'));
		showHelpAndExit(1);
	} else if (program.autoUpdate && !program.dev) {
		console.log(chalk.red('  Option --autoUpdate can only be run along with --dev'));
		showHelpAndExit(1);
	}

	function showHelpAndExit(errorCode = 0) {
		program.outputHelp();
		process.exit(errorCode);
	}
}
