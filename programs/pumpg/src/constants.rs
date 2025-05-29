use anchor_lang::{prelude::*, solana_program};

pub const P: u64 = 1_073_000_191; // inital_virtual_token
pub const R: u64 = 30; //initial_virtual_sol

pub const Q: u128 = 32_190_005_730; // constant_product

pub const SCALE: u64 = 1_000_000; // 10^6 for token decimals

pub const LAMPORTS_PER_SOL: u64 = 1_000_000_000; // 10^9 for solana lamports

pub const TOTAL_SUPPLY: u64 = 1_000_000_000 * SCALE; // 1 billion tokens

pub const BONDING_CURVE_SUPPLY: u64 = 793_100_000 * SCALE; // total supply of bonding curve tokens

pub const COMPLETION_LAMPORTS: u64 = 85 * LAMPORTS_PER_SOL; // ~ 85 SOL

pub const ADMIN: Pubkey = pubkey!("DKbqMnDju2ftYBKM65DhPMLi7foVt5QPmbCmeeTk5eSN");

pub const GLOBAL: &[u8] = b"global";

pub const BONDING_CURVE : &[u8] = b"bonding_curve";

pub const CURVE_VAULT: &[u8] = b"curve-vault";

pub const MIGRATION_FEE : u64 = 6 * LAMPORTS_PER_SOL; // 6 SOL


pub const FUNDING_AMOUNT: u64 = 79 * LAMPORTS_PER_SOL;

pub const WSOL_ID: Pubkey = solana_program::pubkey!("So11111111111111111111111111111111111111112");

pub const DEFAULT_DECIMALS: u8 = 6;

pub const DEFAULT_SUPPLY: u64 = 206_900_000_000_000;

pub const POOL_SEED: &str = "pool";
pub const POOL_LP_MINT_SEED: &str = "pool_lp_mint";
pub const POOL_VAULT_SEED: &str = "pool_vault";
pub const OBSERVATION_SEED: &str = "observation";
pub const AMM_CONFIG_SEED: &str = "amm_config";

pub const AUTH_SEED: &str = "vault_and_lp_mint_auth_seed";

pub const LOCK_CPMM_AUTHORITY: Pubkey = solana_program::pubkey!("3f7GcQFG397GAaEnv51zR6tsTVihYRydnydDD1cXekxH");

/*

pub const DAO_SEED: &[u8] = b"dao_account";
pub const CURATION_SEED: &[u8] = b"curation";

*/