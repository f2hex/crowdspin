#!/usr/bin/env node
/*
 * Tool to to manipulate/generate/validate fake ids for Italian public
 * sector applications.
 *
 * Author: franco.fiorese@dxc.com
 *  Date: July 2019
 *
 */

//'use strict';

const yargs = require('yargs');
const autocannon = require("autocannon");
const crypto = require("crypto");
const cf = require("./citizengen");

var conn = 0;
var hash = crypto.createHash("md5");
var nreq = 1;
var idgen = undefined;
var cfgen = undefined;

function create_id() {

    let id = idgen.generate();
    let codf = cfgen.generate(id);
    let rec = {
        hash: "",
        data: {
            nr: nreq++,
            name: id.name,
            cognome: id.lastname,
            sesso: id.gender,
            cf: codf,
            regione: id.bplace_region,
            provincia: id.bplace_prov,
            comune: id.bplace,
            cap: id.cap,
            normplace: id.bplace_region + "/" + id.bplace_prov + "/" + id.bplace + "/" + id.cap,
            numfam: id.nfam,
            isee: id.isee
        }
    }
    // create hash of record data - useful for server side duplicate identification
    rec.hash = crypto.createHash("sha256").update(JSON.stringify(rec.data), 'utf8').digest('base64')
    return JSON.stringify(rec);
}

function injector(client) {
    client.setHeaders({ 'Content-type': 'application/json; charset=utf-8' })
    client.setBody(create_id());
}

/*
 * Inject a series of random fake citizen records to the specified URL
 * endpoint
 */
function inject(url, conns, duration, count, pipelining) {
		params = {
        url: url,
        method: 'POST',
        pipelining: pipelining,
        connections: conns,
        duration: duration,
        setupClient: injector
		}
		if (count != -1) {
        params.amount = count;
		}
    idgen = new cf.IdentityGenerator();
    cfgen = new cf.CodiceFiscale();
    let inst = autocannon(params, (err, res) => {});
    // call injector after the last successful request
    inst.on('response', (client, sts_code, ret_bytes, resp_time) => {
        if (sts_code == 200) {
            injector(client);
        }
    });

    autocannon.track(inst, {})
}

function generate_fake_id() {
    idgen = new cf.IdentityGenerator();
    cfgen = new cf.CodiceFiscale();
		console.log(create_id());
}

yargs.usage('Usage: $0 <command> [options]')
		.epilog("crowdspin - a tools to deal with fake citizen ids for testing purposes\nFranco Fiorese <franco.fiorese@dxc.com> 2019")
		.showHelpOnFail(false, "Specify --help for available options");

yargs.command('inject <url> [count] [duration] [connections] [pipelining]',
							'Generates, continuously, fake valid citizen ids, complete with the Italian Fiscal Code.\nEach generate id is sent to a RESTful based service specified by a proper endpoint URL.', (yargs) => {
									yargs.positional('url', {
											describe: ' endpoint URL of the remote server to inject to',
											type: 'string'
									}).option('count', {
											alias: 'i',
											description: 'The number of injections to make before exiting. If set, duration is ignored.',
											default: -1,
											type: 'number'
									}).option('duration', {
											alias: 'd',
											description: 'The number of seconds to run the injection. Default: 10',
											default: 10,
											type: 'number'
									}).option('connections', {
											alias: 'c',
											description: 'The number of concurrent connections to use. Default: 10',
											default: 10,
											type: 'number'
									}).option('pipelining', {
											alias: 'p',
											description: 'The number of pipelined requsests to use. Default: 1',
											default: 1,
											type: 'number'
									})
							},
							(argv) => {
									inject(argv.url, argv.connections, argv.duration, argv.count, argv.pipelining);
							});

yargs.command('generate',
							'Generate a fake id', (yargs) => {},
							(argv) => {
									generate_fake_id();
							});

yargs.demandCommand(1, "You need to specify a least one command")
		.help()
		.wrap(80)
		.argv
