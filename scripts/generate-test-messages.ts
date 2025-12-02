#!/usr/bin/env ts-node

/**
 * Script to generate simulated chat history for testing the search feature.
 *
 * Usage:
 *   1. Stop The Lounge server
 *   2. Run: ts-node scripts/generate-test-messages.ts [options]
 *
 * Options:
 *   --user <username>     Username (default: first user found)
 *   --network <uuid>      Network UUID (default: first network in user config)
 *   --channel <name>      Channel name (default: #test)
 *   --count <number>      Number of messages to generate (default: 1000)
 *   --days <number>       Spread messages over N days (default: 30)
 */

import * as sqlite3 from "sqlite3";
import * as path from "path";
import * as fs from "fs";

const SAMPLE_NICKS = [
	"alice", "bob", "charlie", "diana", "eve", "frank", "grace", "henry",
	"iris", "jack", "kate", "leo", "mia", "noah", "olivia", "paul"
];

const SAMPLE_MESSAGES = [
	"Hey everyone!",
	"What's going on?",
	"Did anyone see the latest update?",
	"I think we should merge that PR",
	"The build is failing again",
	"Can someone help me with this issue?",
	"Good morning!",
	"brb, grabbing coffee",
	"lol that's hilarious",
	"Thanks for the help!",
	"Does anyone know how to fix this?",
	"I'll take a look at it later",
	"The tests are passing now",
	"Great work team!",
	"I'm working on the new feature",
	"Let me check the docs",
	"This is taking longer than expected",
	"Almost done with the refactor",
	"Who wants to review my code?",
	"I found a bug in production",
	"Quick question about the API",
	"The server is down",
	"Never mind, figured it out",
	"Pushing a fix now",
	"Can we schedule a meeting?",
	"I'll be AFK for a bit",
	"Back!",
	"Check out this link: https://example.com/article",
	"That makes sense",
	"I disagree, I think we should do it differently",
	"Let's discuss this tomorrow",
	"Added some comments to the PR",
	"Looks good to me!",
	"Deployed to staging",
	"The performance improvement is noticeable",
	"We should add tests for that",
	"I'll create a ticket",
	"Anyone free for a quick call?",
	"Interesting idea",
	"That won't work because of X",
	"True, good point",
	"What do you all think?",
	"I'm +1 on that",
	"-1, needs more discussion",
	"Let me run some benchmarks",
	"The metrics look good",
	"We're hitting the rate limit",
	"I'll increase the timeout",
	"Fixed!",
	"Reverting that change",
	"Sorry, my bad",
];

const SAMPLE_TOPICS = [
	"bug", "feature", "refactor", "docs", "test", "performance",
	"security", "deploy", "review", "help", "coffee"
];

async function getHomePath(): Promise<string> {
	// Default to ~/.thelounge
	return path.join(process.env.HOME || process.env.USERPROFILE || "~", ".thelounge");
}

async function getUsernames(homePath: string): Promise<string[]> {
	const usersPath = path.join(homePath, "users");

	if (!fs.existsSync(usersPath)) {
		throw new Error(`Users directory not found at ${usersPath}`);
	}

	const files = await fs.promises.readdir(usersPath);
	return files
		.filter(f => f.endsWith(".json"))
		.map(f => f.replace(".json", ""));
}

async function getUserConfig(homePath: string, username: string): Promise<any> {
	const configPath = path.join(homePath, "users", `${username}.json`);
	const content = await fs.promises.readFile(configPath, "utf-8");
	return JSON.parse(content);
}

function generateMessage(index: number): { nick: string; text: string } {
	const nick = SAMPLE_NICKS[Math.floor(Math.random() * SAMPLE_NICKS.length)];

	// Mix of random messages and topic-based messages
	if (Math.random() < 0.7) {
		const text = SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];
		return { nick, text };
	} else {
		const topic = SAMPLE_TOPICS[Math.floor(Math.random() * SAMPLE_TOPICS.length)];
		const text = `I was thinking about ${topic}, we should ${SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)].toLowerCase()}`;
		return { nick, text };
	}
}

function generateTimestamp(index: number, totalCount: number, daysSpread: number): number {
	// Spread messages evenly over the time period
	const now = Date.now();
	const millisecondsPerDay = 24 * 60 * 60 * 1000;
	const totalMilliseconds = daysSpread * millisecondsPerDay;
	const step = totalMilliseconds / totalCount;

	// Start from (now - daysSpread) and step forward
	const baseTime = now - totalMilliseconds;
	const timeWithJitter = baseTime + (index * step) + (Math.random() * step * 0.5);

	return Math.floor(timeWithJitter);
}

async function insertMessages(
	dbPath: string,
	networkUuid: string,
	channelName: string,
	count: number,
	daysSpread: number
) {
	return new Promise<void>((resolve, reject) => {
		const db = new sqlite3.Database(dbPath, (err) => {
			if (err) {
				reject(err);
				return;
			}
		});

		db.serialize(() => {
			const stmt = db.prepare(
				"INSERT INTO messages(network, channel, time, type, msg) VALUES(?, ?, ?, ?, ?)"
			);

			for (let i = 0; i < count; i++) {
				const { nick, text } = generateMessage(i);
				const timestamp = generateTimestamp(i, count, daysSpread);

				const msgData = {
					from: {
						nick,
						mode: ""
					},
					text,
					self: false
				};

				stmt.run(
					networkUuid,
					channelName.toLowerCase(),
					timestamp,
					"message",
					JSON.stringify(msgData),
					(err) => {
						if (err) {
							console.error(`Error inserting message ${i}:`, err);
						}
					}
				);
			}

			stmt.finalize((err) => {
				if (err) {
					reject(err);
					return;
				}

				db.close((err) => {
					if (err) {
						reject(err);
						return;
					}
					resolve();
				});
			});
		});
	});
}

async function main() {
	const args = process.argv.slice(2);

	let username: string | null = null;
	let networkUuid: string | null = null;
	let channelName = "#test";
	let count = 1000;
	let daysSpread = 30;

	// Parse arguments
	for (let i = 0; i < args.length; i += 2) {
		const flag = args[i];
		const value = args[i + 1];

		switch (flag) {
			case "--user":
				username = value;
				break;
			case "--network":
				networkUuid = value;
				break;
			case "--channel":
				channelName = value;
				break;
			case "--count":
				count = parseInt(value, 10);
				break;
			case "--days":
				daysSpread = parseInt(value, 10);
				break;
			default:
				console.error(`Unknown flag: ${flag}`);
				process.exit(1);
		}
	}

	const homePath = await getHomePath();
	const logsPath = path.join(homePath, "logs");

	if (!fs.existsSync(logsPath)) {
		throw new Error(`Logs directory not found at ${logsPath}. Is The Lounge initialized?`);
	}

	// Get username if not provided
	if (!username) {
		const usernames = await getUsernames(homePath);
		if (usernames.length === 0) {
			throw new Error("No users found. Create a user first.");
		}
		username = usernames[0];
		console.log(`Using first user found: ${username}`);
	}

	// Get network UUID if not provided
	if (!networkUuid) {
		const config = await getUserConfig(homePath, username);
		if (!config.networks || config.networks.length === 0) {
			throw new Error(`User ${username} has no networks configured`);
		}
		networkUuid = config.networks[0].uuid;
		console.log(`Using first network: ${networkUuid}`);
	}

	const dbPath = path.join(logsPath, `${username}.sqlite3`);

	if (!fs.existsSync(dbPath)) {
		throw new Error(
			`Database not found at ${dbPath}. Make sure SQLite message storage is enabled and The Lounge has run at least once.`
		);
	}

	console.log(`Inserting ${count} messages into:`);
	console.log(`  Database: ${dbPath}`);
	console.log(`  Network: ${networkUuid}`);
	console.log(`  Channel: ${channelName}`);
	console.log(`  Time range: ${daysSpread} days`);
	console.log("");

	await insertMessages(dbPath, networkUuid, channelName, count, daysSpread);

	console.log(`✓ Successfully inserted ${count} messages`);
	console.log(`\nYou can now start The Lounge and join ${channelName} to see the messages.`);
}

main().catch((err) => {
	console.error("Error:", err.message);
	process.exit(1);
});
