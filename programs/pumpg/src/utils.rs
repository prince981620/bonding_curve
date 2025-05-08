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


pub fn compute_S(T: u64) -> Result<u64, Errors> {

    let p_u128 = u128::try_from(P).or(Err(Errors::Overflow))?;

    let scale_u128 = u128::try_from(SCALE).or(Err(Errors::Overflow))?;

    let p_scaled: u128 = p_u128.checked_mul(scale_u128).ok_or(Errors::Overflow)?;

    // let delta_S128 = u128::try_from(delta_S).or(Err(Errors::Overflow))?;

    let t_u128 = u128::try_from(T).or(Err(Errors::Overflow))?;


    let denominator: u128 = p_scaled.checked_sub(t_u128).ok_or(Errors::Overflow)?;

    if denominator == 0 {
        return Err(Errors::InvalidCalculation.into());
    }

    let q_u128 = u128::try_from(Q).or(Err(Errors::Overflow))?;

    let numerator: u128 = q_u128.checked_mul(p_scaled).ok_or(Errors::Overflow)?;

    let part1: u128 = numerator.checked_div(denominator).ok_or(Errors::Overflow)?;

    let r_u128 = u128::try_from(R).or(Err(Errors::Overflow))?;

    let lamports_per_sol_u128 = u128::try_from(LAMPORTS_PER_SOL).or(Err(Errors::Overflow))?;

    let S: u128 = part1
        .checked_mul(lamports_per_sol_u128)
        .ok_or(Errors::Overflow)?
        .checked_sub(r_u128.checked_mul(lamports_per_sol_u128).unwrap()) // check and change this 
        .ok_or(Errors::Underflow)?;
    
    Ok(S as u64)

}

//  recheck bonding curve formula
// cpmm to radium 