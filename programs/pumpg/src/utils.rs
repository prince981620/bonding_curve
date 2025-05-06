use crate::constants::*;
use crate::errors::Errors;



/*


pub const P: u64 = 1_073_000_191; // inital_virtual_token
pub const R: u64 = 30; //initial_virtual_sol

pub const Q: u128 = 32_190_005_730; // constant_product

pub const SCALE: u64 = 1_000_000; // 10^6 for token decimals
pub const LAMPORTS_PER_SOL: u64 = 1_000_000_000; // 10^9 for solana lamports

pub const TOTAL_SUPPLY: u64 = 1_000_000_000 * SCALE; // 1 billion tokens

pub const BONDING_CURVE_SUPPLY: u64 = 793_100_000 * SCALE; // total supply of bonding curve tokens

pub const COMPLETION_LAMPORTS: u64 = 85 * LAMPORTS_PER_SOL; // ~ 85 SOL


*/


pub fn compute_S(T: u64) -> u64 {
    let p_scaled: u128 = (P as u128) * (SCALE as u128);
    let denominator: u128 = p_scaled - (T as u128);

    if denominator == 0 {
        return Err(Errors::InvalidCalculation.into());
    }

    let numerator: 128 = (Q as )




}