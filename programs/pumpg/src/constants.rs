use anchor_lang::{prelude::Pubkey, pubkey};


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

pub const MIGRATION_FEE : u64 = 6 * LAMPORTS_PER_SOL; // 6 SOL


/*

pub const DAO_SEED: &[u8] = b"dao_account";
pub const CURATION_SEED: &[u8] = b"curation";

*/