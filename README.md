# Bonding Curve Smart Contract

This project implements a Pump.fun-like bonding curve mechanism on the Solana blockchain using the Anchor framework. It enables token creation, trading via a bonding curve, and efficient state management for a decentralized token economy.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup](#setup)
- [Building the Contract](#building-the-contract)
- [Running Tests](#running-tests)

---

## Prerequisites

Ensure the following tools are installed on your system with the specified versions:

- **Solana CLI**: 2.1.22 (src:3861dceb; feat:1416569292, client:Agave)
- **Anchor CLI**: 0.31.1
- **Rust**: 1.86.0 (05f9846f8 2025-03-31)
- **Node.js**: v23.11.0
- **Yarn**: Latest version

---

## Installation

Follow these steps to install the required tools:

### Step 1: Install Solana CLI
Install the Solana CLI with the specified version:

```bash
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
```

Verify the version:

```bash
solana --version
```

Expected output: `solana-cli 2.1.22 (src:3861dceb; feat:1416569292, client:Agave)`.

### Step 2: Install Anchor CLI
Install Anchor CLI version 0.31.1 via Cargo:

```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.1 anchor-cli --locked
```

Verify the version:

```bash
anchor --version
```

Expected output: `anchor-cli 0.31.1`.

### Step 3: Install Rust
Install Rust if not already present:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Verify the version:

```bash
rustc --version
```

Expected output: `rustc 1.86.0 (05f9846f8 2025-03-31)`.

### Step 4: Install Node.js and Yarn
Install Node.js version 23.11.0 from [nodejs.org](https://nodejs.org/), then install Yarn globally:

```bash
npm install -g yarn
```

Verify the versions:

```bash
node --version
yarn --version
```

Expected outputs: `v23.11.0` for Node.js and the latest Yarn version.

### Step 5: Install TypeScript Dependencies
Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/bonding_curve.git
cd bonding_curve
yarn
```

This installs all TypeScript dependencies listed in `package.json`.

---

## Setup

### Step 1: Configure Solana CLI
Set the Solana CLI to use a local cluster for development:

```bash
solana config set --url http://localhost:8899
```

### Step 2: Generate a Local Wallet (Optional)
If you need a new wallet for testing:

```bash
solana-keygen new
```

Save the generated keypair for use in testing.

---

## Building the Contract

Compile the smart contract with Anchor:

```bash
anchor build
```

This generates the compiled program in `target/deploy/` (e.g., `bonding_curve.so`) and the IDL file for client interactions.

---

## Running Tests

Run the test suite to validate the contract:

```bash
anchor test
```

This command:
- Launches a local Solana validator.
- Deploys the contract.
- Executes TypeScript tests in the `tests/` directory.

### Expected Output
Successful tests will display:

```
  bonding_curve
    ✔ Initializes bonding curve (500ms)
    ✔ Creates token (600ms)
    ✔ Executes buy transaction (800ms)
  3 passing (2s)
```

If tests fail, see [Troubleshooting](#troubleshooting).

---

## Troubleshooting

### Common Issues
1. **Build Fails**:
   - Ensure Rust and Anchor versions match the prerequisites.
   - Run `cargo update` if dependencies are outdated.

2. **Tests Fail**:
   - Confirm the local validator is running (`solana-test-validator`).
   - Check wallet balance with `solana balance`.

3. **Version Mismatch**:
   - Reinstall tools with the exact versions specified if compatibility issues arise.
