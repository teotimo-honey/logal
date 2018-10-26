# Logal
Welcome to Logal! Send me your Logs!

Logal is a simple logging server which listens for logging input over HTTP, formats it, and spits it out to your console.

## Installation
```
$ npm install -g logal
```

## Usage

### Starting the Server
Basic usage:
```
$ logal -k <at least 8 characters>
```

Formatted:
```
$ logal -f expanded --format-char s --format-size 2 -k <at least 8 characters>
```

Run `logal --help` for more options.

### Sending Logs to the Server

Example payload:
```
{
	"level": 3,
	"log": "2b7938ff5ae5f116e6fde82140d60c43467afefd6c0785b1fb36df2262e8d3d0427864ee6275ca6244c678b987bb8982c825e28b348bc54cb28a9654804609b6",
	"iv": "95c1f0f69d8de1946ea7345a93642d79"
}
```

- **level**: Log level
- **log**: Encrypted string to log. See [Encrypting Log Values](#encrypting-log-values) for more info.
- **iv**: Initialization vector. See [Encrypting Log Values](#encrypting-log-values) for more info.

### Encrypting Log Values

The `log` property must be a string that has been encrypted using Node's `crypto` library using `aes-256-cbc` and an initialization vector.

When sending the values to Logal, both `log` and `iv` must be in hex form.

See the `encrypt` function in the `index.js` file for an example of how to do this.
