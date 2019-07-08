# Crowdspin

A sotware to simplify the creation and validation of digital ids for
the public sector context. With **Crowdspin** it is possible to generate
any number of digital identification records to be used to test
software applications written for the public sector context.

A digital id record usually includes a base set of info:

* Gender
* Name of the person
* Last name
* Birth date
* Birth place (full details: municipality, province, region, ZIP code)
* Italian Fiscal Code

However it is possible to add more if needed.

The generation is purely random and all the created identity are fakes
although there is no guarantee that the generated records could not
match a real person.

The application, at this moment, provides two specific functionalities:

1. Generate a single, fake, id record at each invokation with the
   `generate` command.
2. Generate a continuous series of RESTful request, each one with a
   JSON body including a fake identity record

## Motivation

This software came out after a sort of challenge from colleagues about
the most convienent way to create an record injection software for
test purposes.

## Building it

The current version is built manually - a new update will include the
capability to generate automatically a Docker image of the software.

To build the software just ensure you have the latest version of
Docker (2019) installed, clone this repo, cd into it and run this
command:

```
dockre build -t crowdspin:tag .
```

Where `tag` is any tag you would like to associate to the build.

## Used tecnologies

This software can run on Linux and MacOS, altough possibly could run
on Windows (never tested so far). The software is written in ES6 node
using the following packages:

* [autocannon](https://github.com/mcollina/autocannon), a HTTP/1.1
  benchmarking tool written in node.
* [yargs](https://github.com/yargs/yargs) a tool to build interactive
  command line processor
* [crypto-js](https://github.com/brix/crypto-js) a JavaScript library
  of crypto standards (hash functions used)


## Code style

Mostly based on these guidelines:

* 4 spaces for indentation
* Possibly no tabs (tabs converted to space)
* Use UNIX-style newlines (\n), and a newline character as the last
  character of a file.
* No trailing whitespace
* Use Semicolons
* 80 characters per line: try to stay within the 80 character per line
  if possible
* Opening braces go on the same line
* Always inser curly braces in conditional also for single line statement
* Else clause on a new line just after the closed curly brace
* Use of whitespace before and after the condition statement.
* Declare one variable per var statement
* Use UPPERCASE for Constants
* Use the === operator as much as possible, to prevent stupid errors
* Method chaining: one method per line should be used if you want to
  chain methods
* Requires At Top: Always put requires at top of file to clearly
  illustrate a file's dependencies

## Features

Since this solution is encapsulated in a Docker container image it is
very easy to run, you just need to issue one command, assuimg you have
Docker installed in your system.

## Tests

Automated tests not yet implemented.

## How to use?

Pretty simple, to **generate a single fake id record** run this
command:

```
docker run -it --rm f2hex/crowdspin:0.5 generate
```

to inject to continuous stream of HTTP RESTful request, with a JSON
body containing a fake id record, run this command:

```
docker run -it --rm f2hex/crowdspin:0.5 inject http://target.endpoint.com:8080/idprocessor
```
you need of course to pass a valid URL.
This command provides the following additional options:

```
crowdspin.js inject <url> [count] [duration] [connections] [pipelining]

Generates, continuously, fake valid citizen ids, complete with the Italian
Fiscal Code.
Each generate id is sent to a RESTful based service specified by a proper
endpoint URL.

Positionals:
  url   endpoint URL of the remote server to inject to       [string] [required]

Options:
  --version          Show version number                               [boolean]
  --help             Show help                                         [boolean]
  --count, -i        The number of injections to make before exiting. If set,
                     duration is ignored.                 [number] [default: -1]
  --duration, -d     The number of seconds to run the injection. Default: 10
                                                          [number] [default: 10]
  --connections, -c  The number of concurrent connections to use. Default: 10
                                                          [number] [default: 10]
  --pipelining, -p   The number of pipelined requsests to use. Default: 1
                                                           [number] [default: 1]
```

The `inject` command can generate, on a MacBook Pro i7, about 1K
requests per second in a local network.

## Credits

Franco Fiorese (main author).  This software is built using a lot of
open source software part of the node.js community.  A specific open
source software project,
[CodiceFiscaleJS](https://github.com/lucavandro/CodiceFiscaleJS)
written by Luca Adalberto Vandro, for processing the Italian Fiscal
code has been used.

