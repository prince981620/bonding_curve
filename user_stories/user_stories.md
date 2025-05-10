# Evolution of surprise.fun User Stories

This document outlines the iterative refinement of user stories for surprise.fun, a decentralized platform with dynamic bonding curves and AI-driven token purchases. The initial draft (Draft 1) will evolve through revisions to create a refined and actionable set of user stories (Draft 2).

## Decentralized Platform with AI and Randomly Selected Bonding Curves (PoC)

### Project Name: surprise.fun

**Value Proposition:**

surprise.fun uses blockchain and AI to make a fun token world. Creators can make unique tokens, traders can trade with excitement, and everyone can buy tokens with AI help. A special "surprise" bonding curve adds a twist!

**Product-Market Fit:**

Normal token platforms are boring and stiff. surprise.fun fixes this with random bonding curves (including "surprise") and fun AI features, making a fair and lively place for all.

**Target User Profiles:**

The "Creative Maker": This person loves making new token projects with fun pricing. They like surprises and ways to reach lots of people. They hate boring systems.

The "Smart Trader": This person wants to earn money from price changes. They like quick info and fun buying options. They don’t like unclear or strict platforms.

The "AI Lover": This person enjoys AI fun. They like chatting to buy tokens and learning. They avoid dull or hard-to-use systems.

**User Story ID: SUR-001**

1. **User Persona**
Name: Emma
Role: Creative Maker
Goal: Start a token project with a fun, changing price.
2. **User Story**
As a creative maker, I want to start a token project where the bonding curve, including a "surprise" one, is picked randomly (like linear, exponential, sigmoid, logarithmic, or custom), so my project is exciting and draws in traders.
3. **Acceptance Criteria**
Functionality:
The platform lets me start a token project and picks a random bonding curve,
It works with simple steps like start, set rules, create, buy, sell, move, and take out. 
4. **Platform Attributes:**
The curve sets the price based on how many tokens there are, updating live.
User Interaction:
I can start the project, watch traders join, and share it on Twitter or Discord.
Security:
The random picked Bonding Curve is fair and safe on the blockchain.
My project info is locked and stored safely with tools like Token Program.
5. **Priority: High**
6. **Technical Notes (for Developers)**
Dependencies:
Needs a smart rule for picking curves randomly and figuring prices.
Must connect with tools like Token Program, MPL Metadata, and DEX Raydium, plus accounts like Global State.
**Considerations**:
Keep it fast for live updates and sharing online.

**Draft 1**

**Evolution of surprise.fun User Stories**

This document outlines the initial set of user stories for **surprise.fun**, a Solana SPL‑coin platform where anyone can launch a meme token with a random bonding curve, use AI agents to promote it on social media, trade tokens with live price charts, and automatically seed a major DEX once the curve sells out.

---

## **Decentralized Meme Tokens on Solana (PoC)**

**Project Name:** surprise.fun

**Value Proposition:**

- Anyone can create a fun SPL token on Solana with a randomly chosen bonding curve.
- AI agents spin up unique personas to promote the token on Twitter, Discord, Telegram, etc.
- Traders can buy and sell tokens through a live price graph.
- When the bonding curve fills, remaining tokens and SOL flow into a major DEX (e.g. Raydium) for continued liquidity.

**Product–Market Fit:**

Launching and marketing a token today requires manual curve setup, liquidity sourcing, and outreach. surprise.fun bundles token creation, random curves, AI‑driven promotion, trading UI, and automated post‑launch liquidity, making meme‑coin launches and trading seamless.

**Target User Profiles:**

1. **DIY Token Creator**
    - **Who they are:** Hobbyists or small communities curious about launching their own meme coin.
    - **Needs:** A one‑stop shop to mint a token, receive a random bonding curve, and list it for trading instantly.
    - **Frustrations:** Manual curve configuration, finding initial liquidity, hiring promoters.
2. **Social Media Promoter**
    - **Who they are:** Users who want their token to go viral but lack time or budget for full campaigns.
    - **Needs:** An AI assistant that generates a persona, crafts posts, and shares them across selected channels.
    - **Frustrations:** Writing and scheduling content on multiple platforms.
3. **Crypto Trader**
    - **Who they are:** DeFi enthusiasts hunting for new meme coins and quick gains.
    - **Needs:** A straightforward interface to buy/sell tokens and view a real‑time price chart.
    - **Frustrations:** Slow updates, poor charting tools, manual DEX navigation.

---

### **User Story ID: MC-001**

1. **User Persona**
    - Name: Riley
    - Role: DIY Token Creator
    - Goal: Launch a meme SPL token with a random bonding curve.
2. **User Story**
    
    As a token creator, I want to provide basic details (name, symbol, description, image, initial purchase amount) and have the system pick a random bonding curve so that I can mint my meme coin without manual curve setup.
    
3. **Acceptance Criteria**
    - **Functionality:**
        - Form to enter token name, symbol, description, image, and initial purchase amount.
        - “Launch Token” button selects a random bonding curve ,launch token and navigate user to the token page
    - **Attributes:**
        - Curve type (e.g. linear, exponential, step‑based) and key parameters visible to the user.
    - **User Interaction:**
        - Preview page shows the token’s name, ticker, description, image, purchase amount, and the selected curve graph.
4. **Priority:** High
5. **Technical Notes:**
    - Use the Solana SPL SDK to interact with the bonding‑curve smart contract.
    - Integrate a secure pseudo‑random algorithm for curve selection.

---

### **User Story ID: MC-002**

1. **User Persona**
    - Name: Jordan
    - Role: Social Media Promoter
    - Goal: Have an AI persona create and post content about my new token on Twitter, Discord, and Telegram.
2. **User Story**
    
    As a promoter, I want an AI agent to generate a persona name, profile picture, bio, and draft posts, then publish them on chosen channels so that my token launch gains visibility automatically.
    
3. **Acceptance Criteria**
    - **Functionality:**
        - Options to select channels (Twitter, Discord, Telegram).
        - “Launch AI Promo” button spins up an agent persona and schedules posts.
        - Dashboard displays scheduled posts and their statuses.
    - **Attributes:**
        - Auto‑generated persona picture and bio.
        - Editable post drafts before publishing.
    - **User Interaction:**
        - Ability to review, finalize, or cancel each post.
        - Discord integration requires a bot added to the selected channel.
4. **Priority:** Medium
5. **Technical Notes:**
    - Use a lightweight LLM for text generation.
    - Integrate with each platform’s API for automated posting.

---

### **User Story ID: MC-003**

1. **User Persona**
    - Name: Sam
    - Role: Crypto Trader
    - Goal: Buy or sell tokens quickly and watch a live price graph.
2. **User Story**
    
    As a trader, I want to place buy and sell orders and see a real‑time chart of the token’s price so that I can make informed trading decisions.
    
3. **Acceptance Criteria**
    - **Functionality:**
        - “Buy” and “Sell” buttons with amount inputs and estimated fills.
        - Live price chart updating every few seconds.
        - Order history list.
    - **Attributes:**
        - Chart shows price vs. time since launch.
        - Optional depth‑of‑book display.
    - **User Interaction:**
        - Tooltips on the chart show exact values at specific times.
4. **Priority:** High
5. **Technical Notes:**
    - Subscribe to on‑chain price feeds or use an indexer.
    - Employ WebSocket or polling for low‑latency updates.

---

### **User Story ID: MC-004**

1. **User Persona**
    - Name: System
    - Role: Platform Operator
    - Goal: Move remaining tokens and SOL into Raydium once the bonding curve sells out.
2. **User Story**
    
    As the system, I want to detect when the bonding curve is complete and automatically deposit leftover assets into Raydium so that the token retains strong liquidity.
    
3. **Acceptance Criteria**
    - **Functionality:**
        - Monitor curve balance and total tokens sold.
        - Trigger Raydium deposit transaction when criteria are met.
    - **Attributes:**
        - Confirmation log of the on‑chain deposit.
    - **User Interaction:**
        - Admin dashboard displays deposit status and transaction details.
4. **Priority:** Medium
5. **Technical Notes:**
    - Use Solana CPI to call Raydium’s smart contract for liquidity deposits.
    - Ensure idempotent operation to prevent duplicate deposits.