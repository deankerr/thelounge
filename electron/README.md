# The Lounge Electron Wrapper

A simple Electron wrapper for The Lounge IRC client.

## Setup

1. Install dependencies:
   ```bash
   yarn electron:install
   ```

2. Start The Lounge server:
   ```bash
   yarn dev
   # or for production
   yarn start
   ```

3. Launch the Electron app:
   ```bash
   yarn electron:dev
   # or for production mode
   yarn electron
   ```

## Building

- **Development**: `yarn electron:dev` (opens dev tools automatically)
- **Production**: `yarn electron`
- **Package**: `yarn electron:pack` (creates distributable package)
- **Build**: `yarn electron:build` (creates installer/app bundle)

## Features

- Native desktop application wrapper
- Proper window management and menus
- External links open in default browser
- Cross-platform support (macOS, Windows, Linux)
- Development mode with auto-dev-tools

## Configuration

The wrapper connects to `http://localhost:9000` by default. To change this, edit the `DEFAULT_URL` in `main.js`.