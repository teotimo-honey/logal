#!/usr/bin/env node

const options = require('options-parser');
const http = require('http');
const os = require('os');
const package = require('./package');

const opts = options.parse({
  level: {
    help: 'Which log level to show (debug, info, error)',
    default: 'debug',
  },
  host: {
    short: 'h',
    help: 'Which host to listen on',
    default: '0.0.0.0',
  },
  port: {
    short: 'p',
    varName: 'PORT',
    help: 'Which port to listen on',
    default: '1095',
  },
  help: {
    short: 'h',
    help: 'This help screen',
    showHelp: { 
      banner: 'example: logal [options]'
    }
  },
  version: {
    short: 'v',
    help: 'Get the logal version',
    flag: true,
  }
});

if (opts.opt.version) {
  console.log(`logal ${package.version}`)
  process.exit(0);
}

const getLogLevel = (strLevel) => {
  switch (opts.opt.level) {
    case 'error': return 3;
    case 'warn': return 2;
    case 'info': return 1;
    default: return 0;
  }
}

const outputLogLevel = getLogLevel(opts.opt.level);
const port = parseInt(opts.opt.port);
const host = opts.opt.host;

let localIp;
const interfaces = os.networkInterfaces();
const en0 = interfaces['en0'];
if (en0) {
  en0.forEach((interface) => {
    if ('IPv4' !== interface.family || interface.internal) {
      return;
    }

    localIp = interface.address;
  });
} else {
  console.log('en0 interface not found. Check ifconfig to determine your local IP address.');
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());

    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        const logLevel = getLogLevel(json.level || 1);
        if (logLevel >= outputLogLevel) {
          console.log(`[${new Date()}]`, JSON.stringify(json.log));
        }

        res.writeHead(200);
        res.end('200 OK');
      } catch(e) {
        console.error("Couldn't parse JSON");
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    });

  } else {
    res.writeHead(400);
    res.end('400 Bad Request');
  }
});

server.listen(port, host, (err) => {
  if (err) {
    return console.log('error', err);
  }

  console.log('send me your logs!');
  console.log(`Local IP: ${localIp || 'Unknown'}`);
  console.log(`Port: ${port}`);
})