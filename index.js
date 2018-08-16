#!/usr/bin/env node

const options = require('options-parser');
const http = require('http');
const os = require('os');
var colors = require('colors/safe');
const package = require('./package');

const opts = options.parse({
  level: {
    short: 'L',
    help: 'Which log level to show (debug, info, warn, error)',
    default: 'debug',
  },
  format: {
    short: 'f',
    help: 'Output format. Options are: [collapsed, expanded]',
    default: 'collapsed',
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
    help: 'This help screen',
    showHelp: {
      banner: 'example: logal [options]'
    },
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

let space;
switch (opts.opt.format) {
  case 'expanded': {
    space = '\t';
    break;
  }
  case 'collapsed':
  default: {
    space = null; // No spaces
  }
}

const levelColor = (numLevel) => {
  switch (numLevel) {
    case 0:
      return colors.blue;
    case 2:
      return colors.yellow;
    case 3:
      return colors.red;
    default:
      return colors.reset;
  }
}

const getLogLevel = (strLevel) => {
  switch (strLevel) {
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
  console.warn(colors.yellow('en0 interface not found. Check ifconfig to determine your local IP address.'));
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
          const msgColor = levelColor(logLevel);
          const formattedDate = new Date().toLocaleDateString('en', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
          });
          console.log(colors.magenta(`[${json.level}] [${formattedDate}]`), msgColor(JSON.stringify(json.log, null, space)));
        }

        res.writeHead(200);
        res.end('200 OK');
      } catch(e) {
        console.error(colors.red("Couldn't parse JSON"));
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

  console.log(colors.green('Welcome to Logal! Send me your Logs!'));
  console.log(colors.grey('Local IP: ') + colors.reset.bold(localIp || 'Unknown'));
  console.log(colors.grey('Port: ') + colors.reset.bold(port));
})