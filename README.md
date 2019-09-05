# @blockpool-io/peers

<p align="center">
    <img src="https://raw.githubusercontent.com/blockpool-io/peers/master/banner.png" />
</p>

[![Latest Version](https://badgen.now.sh/npm/v/@blockpool-io/peers)](https://www.npmjs.com/package/@blockpool-io/peers)
[![Node Engine](https://badgen.now.sh/npm/node/@blockpool-io/peers)](https://www.npmjs.com/package/@blockpool-io/peers)
[![Build Status](https://badgen.now.sh/circleci/github/blockpool-io/typescript-peers)](https://circleci.com/gh/blockpool-io/typescript-peers)
[![Codecov](https://badgen.now.sh/codecov/c/github/blockpool-io/typescript-peers)](https://codecov.io/gh/blockpool-io/typescript-peers)
[![License: MIT](https://badgen.now.sh/badge/license/MIT/green)](https://opensource.org/licenses/MIT)

> Lead Maintainer: [Brian Faust](https://github.com/faustbrian)

## Installation

```bash
yarn add @blockpool-io/peers
```

## Usage

### Peers via GitHub

```ts
import { PeerDiscovery } from "@blockpool-io/peers";

await PeerDiscovery.new("devnet")
	.withVersion(">=2.4.0-next.0")
	.withLatency(300)
	.sortBy("latency")
	.findPeersWithPlugin("core-api");
```

### Peers via Relay

```ts
import { PeerDiscovery } from "@blockpool-io/peers";

await PeerDiscovery.new("http://api.testnet.blockpool.io:9031/api/v2/peers")
	.withVersion(">=2.4.0-next.0")
	.withLatency(300)
	.sortBy("latency")
	.findPeersWithPlugin("core-api");
```

## Testing

```bash
yarn test
```

## Security

If you discover a security vulnerability within this package, please send an e-mail to support@blockpool.io. All security vulnerabilities will be promptly addressed.

## Credits

This project exists thanks to all the people who [contribute](../../contributors).

## License

[MIT](LICENSE) © [Blockpool](https://blockpool.io)
[MIT](LICENSE) © [ARK Ecosystem](https://ark.io)
