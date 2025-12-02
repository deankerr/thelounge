# Generate Test Messages

This script generates simulated chat history for testing the search feature with larger message volumes.

## Prerequisites

1. The Lounge must be installed and initialized (have run at least once)
2. SQLite message storage must be enabled
3. At least one user account must exist
4. The server must be **stopped** before running this script

## Usage

### Using Node.js (recommended)

```bash
node scripts/generate-test-messages.mjs
```

### Using TypeScript (requires ts-node)

```bash
ts-node scripts/generate-test-messages.ts
```

## Options

All options are optional. If not specified, sensible defaults will be used:

- `--user <username>` - Target user (default: first user found)
- `--network <uuid>` - Network UUID (default: first network in user config)
- `--channel <name>` - Channel name (default: #test)
- `--count <number>` - Number of messages to generate (default: 1000)
- `--days <number>` - Spread messages over N days (default: 30)

## Examples

### Generate 1000 messages in #test (default)

```bash
node scripts/generate-test-messages.mjs
```

### Generate 5000 messages spread over 90 days

```bash
node scripts/generate-test-messages.mjs --count 5000 --days 90
```

### Generate messages for a specific channel and user

```bash
node scripts/generate-test-messages.mjs --user myuser --channel "#development"
```

### Generate a large dataset (10k messages over 6 months)

```bash
node scripts/generate-test-messages.mjs --count 10000 --days 180
```

## What it does

The script:

1. Finds your The Lounge home directory (`~/.thelounge`)
2. Identifies the target user and network
3. Directly inserts simulated messages into the SQLite database
4. Generates realistic-looking chat messages from various fake users
5. Spreads the messages evenly across the specified time range

The generated messages include:

- Various common IRC chat phrases
- Different nicknames (alice, bob, charlie, etc.)
- Realistic timestamps distributed over the time period
- Topic-based conversations (bugs, features, deployments, etc.)

## After running

1. Start The Lounge server
2. Join the target channel (default: #test)
3. The messages will appear in the channel history
4. Use the search feature to test with the larger dataset

## Notes

- **IMPORTANT**: Always stop The Lounge server before running this script to avoid database conflicts
- Messages are inserted directly into SQLite, bypassing the normal IRC flow
- The script does not create the channel - you'll need to join it after starting the server
- Messages will have timestamps in the past, distributed evenly over the specified time range
- Existing messages in the channel are preserved; new ones are added
