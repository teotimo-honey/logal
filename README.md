# Logal
Welcome to Logal! Send me your Logs!

Logal is a simple logging server which listens for logging input over HTTP, formats it, and spits it out to your console.

## Installation
```
$ npm install -g logal
```

## Usage
Basic usage:
```
$ logal -k <at least 8 characters>
```

Formatted:
```
$ logal -f expanded --format-char s --format-size 2 -k <at least 8 characters>
```

Run `logal --help` for more options.
