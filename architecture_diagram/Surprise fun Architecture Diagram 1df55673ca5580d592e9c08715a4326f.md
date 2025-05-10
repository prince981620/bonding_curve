# Surprise.fun Architecture Diagram

## High-Level Protocol Overview

The Surprise.fun protocol enables creation and management of token with random bonding curves on Solana, allowing users to:

- **initialize** the global configuration state [Admin]
- **setParams** for liquidity and fee parameters [Admin]
- **create** new token with metadata & Random bonding curves [User]
- **buy** and **sell** tokens via dynamic bonding logic [User]
- **withdraw** reserves upon curve completion and migrate liquidity to a DEX [User]

## Requirements Table

| Feature | Description |
| --- | --- |
| Token Support | SPL Tokens (TURBIN3, TRUMP, etc.) |
| PDA Management | Global, BondingCurve, Mint Authority |
| Curve Mechanics | Virtual/real reserves, bonding formula |
| Curve Types | Linear, Exponential, Logarithmic, S-Curve, Step-Based |
| Admin Control | Parameter settings, liquidity migration |
| User Actions | Buy, Sell, Create |
| Event Emission | SetParamsEvent, TradeEvent, CreateEvent, CompleteEvent |
| Error Handling | Slippage checks, authorization, initialization guards |

---

## 1. Program Structure & Instruction Flows

### Instruction Overview

![Editor _ Mermaid Chart-2025-04-24-172105.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-172105.svg)

---

### Initialize Instruction

Creates and initializes the global state configuration.

### initialize Instruction Flow

![Editor _ Mermaid Chart-2025-04-24-180957.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-180957.svg)

### Accounts

| Account | Type | Role |
| --- | --- | --- |
| Global | PDA | Stores protocol parameters |
| User | Signer | Authorizes initialization |
| System Program | Sys | Allocates on-chain account |

![Editor _ Mermaid Chart-2025-04-24-161734.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-161734.svg)

---

### SetParams Instruction

Sets protocol fees and reserve values in global state.

### setParams Instruction Flow

![Editor _ Mermaid Chart-2025-04-24-181427.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-181427.svg)

### Accounts

| Account | Type | Role |
| --- | --- | --- |
| Global | PDA | Holds parameters |
| User | Signer | Authorized admin |
| Event Authority | Pubkey | Emits SetParamsEvent |
| System Program | Sys | Required for CPI |
| Surprise.fun Prog | Program | Program ID |

![Editor _ Mermaid Chart-2025-04-24-161639.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-161639.svg)

---

### Create Instruction

Creates a bonding curve PDA, token metadata, and associated accounts.

### create Instruction Flow

![Editor _ Mermaid Chart-2025-04-24-181516.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-181516.svg)

### Accounts

| Account | Type | Role |
| --- | --- | --- |
| Mint | Signer | New token mint authority |
| Mint Authority | PDA | Derivative for mint operations |
| Bonding Curve | PDA | Stores curve reserves & state |
| Associated BondingCurve | ATA | Token vault for bonding curve |
| Metadata Account | PDAMeta | Stores token metadata |
| mpl_token_metadata | Program | Metaplex metadata program |
| User | Signer | Creator of curve |
| Global | PDA | References global config |
| System, Token, Rent | Sys/Prog | Required CPIs |

---

![Editor _ Mermaid Chart-2025-04-24-162027.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-162027.svg)

### Buy Instruction

Allows users to buy tokens from a bonding curve using SOL, with slippage guard.

### buy Instruction Flow

![Editor _ Mermaid Chart-2025-04-24-181555.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-181555.svg)

### Accounts

| Account | Type | Role |
| --- | --- | --- |
| Global | PDA | Reads fee parameters |
| Bonding Curve | PDA | Holds reserves |
| Associated BondingCurve | ATA | Receives SOL |
| Fee Recipient | Account | Receives protocol fees |
| User | Signer | Pays SOL, receives tokens |
| System, Token, Rent | Sys/Prog | Required CPIs |

![Editor _ Mermaid Chart-2025-04-24-160743.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-160743.svg)

---

### Sell Instruction

Enables token holders to sell tokens back into the curve, guarding min output.

### sell Instruction Flow

![Editor _ Mermaid Chart-2025-04-24-181640.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-181640.svg)

### Accounts

| Account | Type | Role |
| --- | --- | --- |
| Global | PDA | Reads fee parameters |
| Bonding Curve | PDA | Holds reserves |
| Associated BondingCurve | ATA | Burns user tokens |
| Fee Recipient | Account | Receives protocol fees |
| User | Signer | Sends tokens, receives SOL |
| System, Token, Rent | Sys/Prog | Required CPIs |

![Editor _ Mermaid Chart-2025-04-24-160420.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-160420.svg)

---

### Withdraw Instruction

Admin withdraws liquidity when curve is complete, then migrates to a DEX (e.g., Raydium).

### withdraw Instruction Flow

![Editor _ Mermaid Chart-2025-04-24-181802.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-181802.svg)

### Accounts

| Account | Type | Role |
| --- | --- | --- |
| Global | PDA | Checks completion flag |
| Bonding Curve | PDA | Holds remaining reserves |
| Admin | Signer | Authorized withdrawal |
| Associated BondingCurve | ATA | Source vault |
| Raydium Pool | Program | Destination DEX via CPI |
| System, Token, Rent | Sys/Prog | Required CPIs |

---

![Editor _ Mermaid Chart-2025-04-24-155913.png](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-155913.png)

## 4. Error Definitions & Handling

![Editor _ Mermaid Chart-2025-04-24-160259.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-160259.svg)

- **NotAuthorized**: Unauthorized signer.
- **AlreadyInitialized**: initialize called twice.
- **TooMuchSolRequired**: buy slippage fail.
- **TooLittleSolReceived**: sell slippage fail.
- **BondingCurveNotComplete**: withdraw before completion.

---

## 5. Account Structure Mapping

![Editor _ Mermaid Chart-2025-04-24-181853.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-181853.svg)

## 6. External Dependencies & Integrations

![Editor _ Mermaid Chart-2025-04-24-181934.svg](Surprise%20fun%20Architecture%20Diagram%201df55673ca5580d592e9c08715a4326f/Editor___Mermaid_Chart-2025-04-24-181934.svg)