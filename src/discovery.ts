import got from "got";
import isUrl from "is-url-superb";
import orderBy from "lodash.orderby";
import semver from "semver";
import { IPeer, IPeerResponse } from "./interfaces";

export class PeerDiscovery {
	private version: string | undefined;
	private latency: number | undefined;
	private orderBy: string[] = ["latency", "desc"];

	private constructor(private readonly seeds: IPeer[]) {}

	public static async new({
		networkOrHost,
		defaultPort = 9031,
	}: {
		networkOrHost: string;
		defaultPort?: number;
	}): Promise<PeerDiscovery> {
		if (!networkOrHost || typeof networkOrHost !== "string") {
			throw new Error("No network or host provided");
		}

		const seeds: IPeer[] = [];

		try {
			if (isUrl(networkOrHost)) {
				const { body } = await got.get(networkOrHost);

				for (const seed of JSON.parse(body).data) {
					let port = defaultPort;
					if (seed.ports) {
						const walletApiPort = seed.ports["@blockpool-io/core-wallet-api"];
						const apiPort = seed.ports["@blockpool-io/core-api"];
						if (walletApiPort >= 1 && walletApiPort <= 65535) {
							port = walletApiPort;
						} else if (apiPort >= 1 && apiPort <= 65535) {
							port = apiPort;
						}
					}

					seeds.push({ ip: seed.ip, port });
				}
			} else {
				const { body } = await got.get(
					`https://raw.githubusercontent.com/blockpool-io/peers/master/${networkOrHost}.json`,
				);

				for (const seed of JSON.parse(body)) {
					seeds.push({ ip: seed.ip, port: defaultPort });
				}
			}
		} catch (error) {
			throw new Error("Failed to discovery any peers.");
		}

		if (!seeds.length) {
			throw new Error("No seeds found");
		}

		return new PeerDiscovery(seeds);
	}

	public getSeeds(): IPeer[] {
		return this.seeds;
	}

	public withVersion(version: string): PeerDiscovery {
		this.version = version;

		return this;
	}

	public withLatency(latency: number): PeerDiscovery {
		this.latency = latency;

		return this;
	}

	public sortBy(key: string, direction = "desc"): PeerDiscovery {
		this.orderBy = [key, direction];

		return this;
	}

	public async findPeers(opts: any = {}): Promise<IPeerResponse[]> {
		if (!opts.retry) {
			opts.retry = { retries: 0 };
		}

		if (!opts.timeout) {
			opts.timeout = 3000;
		}

		const seed: IPeer = this.seeds[Math.floor(Math.random() * this.seeds.length)];

		const { body } = await got.get(`http://${seed.ip}:${seed.port}/api/v2/peers`, {
			...opts,
			...{
				headers: {
					"Content-Type": "application/json",
				},
			},
		});

		let peers: IPeerResponse[] = JSON.parse(body).data;

		if (this.version) {
			peers = peers.filter((peer: IPeerResponse) => semver.satisfies(peer.version, this.version));
		}

		if (this.latency) {
			peers = peers.filter((peer: IPeerResponse) => peer.latency <= this.latency);
		}

		return orderBy(peers, [this.orderBy[0]], [this.orderBy[1] as any]);
	}

	public async findPeersWithPlugin(name: string, opts: { additional?: string[] } = {}): Promise<IPeer[]> {
		const peers: IPeer[] = [];

		for (const peer of await this.findPeers(opts)) {
			const pluginName: string | undefined = Object.keys(peer.ports).find(
				(key: string) => key.split("/")[1] === name,
			);

			if (pluginName) {
				const port: number = peer.ports[pluginName];

				if (port >= 1 && port <= 65535) {
					const peerData: IPeer = {
						ip: peer.ip,
						port,
					};

					if (opts.additional && Array.isArray(opts.additional)) {
						for (const additional of opts.additional) {
							if (typeof peer[additional] === "undefined") {
								continue;
							}

							peerData[additional] = peer[additional];
						}
					}

					peers.push(peerData);
				}
			}
		}

		return peers;
	}
}
