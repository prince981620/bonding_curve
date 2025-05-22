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



pub fn compute_S(T: u64) -> Result<u64, Errors> {

    let p_scaled: u128 = (P as u128) * (SCALE as u128);

    let denominator: u128 = p_scaled - (T as u128);

    if denominator == 0 {
        return Err(Errors::InvalidCalculation.into());
    }

    let numerator: u128 = (Q as u128) * (SCALE as u128);

    let part1: u128 = numerator / denominator;

    let S: u128 = part1
        .checked_mul(LAMPORTS_PER_SOL as u128)
        .ok_or(Errors::Overflow)?
        .checked_sub((R as u128) * (LAMPORTS_PER_SOL as u128))
        .ok_or(Errors::Underflow)?;

    Ok(S as u64)

}

*/


pub fn compute_s(t: u64) -> Result<u64, Errors> {
    let p_u128 = u128::try_from(P).or(Err(Errors::Overflow))?;
    let scale_u128 = u128::try_from(SCALE).or(Err(Errors::Overflow))?;
    let p_scaled: u128 = p_u128.checked_mul(scale_u128).ok_or(Errors::Overflow)?;

    let t_u128 = u128::try_from(t).or(Err(Errors::Overflow))?;
    
    // Prevent underflow by ensuring t <= p_scaled
    if t_u128 > p_scaled {
        return Err(Errors::InvalidCalculation.into());
    }

    let denominator: u128 = p_scaled.checked_sub(t_u128).ok_or(Errors::Underflow)?;
    
    if denominator == 0 {
        return Err(Errors::InvalidCalculation.into());
    }

    let q_u128 = u128::try_from(Q).or(Err(Errors::Overflow))?;
    let numerator: u128 = q_u128.checked_mul(scale_u128).ok_or(Errors::Overflow)?;
    let lamports_per_sol_u128 = u128::try_from(LAMPORTS_PER_SOL).or(Err(Errors::Overflow))?;

    let numerator_lamp: u128 = numerator.checked_mul(lamports_per_sol_u128).ok_or(Errors::Overflow)?;

    let part1: u128 = numerator_lamp.checked_div(denominator).ok_or(Errors::Overflow)?;

    let r_u128 = u128::try_from(R).or(Err(Errors::Overflow))?;

    let r_term = r_u128
        .checked_mul(lamports_per_sol_u128)
        .ok_or(Errors::Overflow)?;

    let s: u128 = part1
        .checked_sub(r_term)
        .ok_or(Errors::Underflow)?;

    Ok(s as u64)
}

pub fn compute_s_in(v_token_reserve: u64, v_sol_reserve: u64, t_out : u64) -> Result<u64, Errors> {
    let v_token_128 = u128::try_from(v_token_reserve).or(Err(Errors::Overflow))?;

    let scale_u128 = u128::try_from(SCALE).or(Err(Errors::Overflow))?;

    // let v_token_scaled: u128 = v_token_128.checked_mul(scale_u128).ok_or(Errors::Overflow)?;

    let t_out_128 = u128::try_from(t_out).or(Err(Errors::Overflow))?;

    if t_out_128 > v_token_128 {
        return Err(Errors::InvalidCalculation.into());
    }

    let denominator: u128 = v_token_128.checked_sub(t_out_128).ok_or(Errors::Overflow)?;

    if denominator == 0 {
        return Err(Errors::InvalidCalculation.into());
    }

    let constant_product_u128 = u128::try_from(Q).or(Err(Errors::Overflow))?;

    let lamports_per_sol_u128: u128 = u128::try_from(LAMPORTS_PER_SOL).or(Err(Errors::Overflow))?;

    let multiplicative_factor: u128 = lamports_per_sol_u128.checked_mul(scale_u128).ok_or(Errors::Overflow)?;
    
    let numerator: u128 = constant_product_u128.checked_mul(multiplicative_factor).ok_or(Errors::Overflow)?;

    let part_1: u128 = numerator.checked_div(denominator).ok_or(Errors::InvalidCalculation)?;

    let part_2 = u128::try_from(v_sol_reserve).or(Err(Errors::Overflow))?;

    let s_in :u128 = part_1.checked_sub(part_2).ok_or(Errors::Underflow)?;

    let s_in_u64 = u64::try_from(s_in).or(Err(Errors::Overflow))?;

    Ok(s_in_u64)
    
}

pub fn compute_s_out(v_token_reserve: u64, v_sol_reserve: u64, t_in : u64) -> Result<u64, Errors> {
    let v_token_128 = u128::try_from(v_token_reserve).or(Err(Errors::Overflow))?;


    // let v_token_scaled: u128 = v_token_128.checked_mul(scale_u128).ok_or(Errors::Overflow)?;

    let t_in_128 = u128::try_from(t_in).or(Err(Errors::Overflow))?;

    // if t_in_128 > v_token_128 {
    //     return Err(Errors::InvalidCalculation.into());
    // }

    let denominator: u128 = v_token_128.checked_add(t_in_128).ok_or(Errors::Overflow)?;

    if denominator == 0 {
        return Err(Errors::InvalidCalculation.into());
    }

    let constant_product_u128 = u128::try_from(Q).or(Err(Errors::Overflow))?;

    let lamports_per_sol_u128: u128 = u128::try_from(LAMPORTS_PER_SOL).or(Err(Errors::Overflow))?;

    let scale_u128 = u128::try_from(SCALE).or(Err(Errors::Overflow))?;

    let multiplicative_factor: u128 = lamports_per_sol_u128.checked_mul(scale_u128).ok_or(Errors::Overflow)?;
    
    let numerator: u128 = constant_product_u128.checked_mul(multiplicative_factor).ok_or(Errors::Overflow)?;
    
    let part_1 = u128::try_from(v_sol_reserve).or(Err(Errors::Overflow))?;

    let part_2: u128 = numerator.checked_div(denominator).ok_or(Errors::InvalidCalculation)?;

    if part_2 > part_1 {
        return Err(Errors::Overflow.into());
    }

    let s_out :u128 = part_1.checked_sub(part_2).ok_or(Errors::Underflow)?;

    let s_out_u64 = u64::try_from(s_out).or(Err(Errors::Overflow))?;

    Ok(s_out_u64)
    
}



// pub fn compute_S(t: u64) -> Result<u64, Errors> {

//     let p_u128 = u128::try_from(P).or(Err(Errors::Overflow))?;

//     let scale_u128 = u128::try_from(SCALE).or(Err(Errors::Overflow))?;

//     let p_scaled: u128 = p_u128.checked_mul(scale_u128).ok_or(Errors::Overflow)?;

//     // let delta_S128 = u128::try_from(delta_S).or(Err(Errors::Overflow))?;

//     let t_u128 = u128::try_from(t).or(Err(Errors::Overflow))?;


//     let denominator: u128 = p_scaled.checked_sub(t_u128).ok_or(Errors::Overflow)?;

//     if denominator == 0 {
//         return Err(Errors::InvalidCalculation.into());
//     }

//     let q_u128 = u128::try_from(Q).or(Err(Errors::Overflow))?;

//     let numerator: u128 = q_u128.checked_mul(scale_u128).ok_or(Errors::Overflow)?;

//     let part1: u128 = numerator.checked_div(denominator).ok_or(Errors::Overflow)?;

//     let r_u128 = u128::try_from(R).or(Err(Errors::Overflow))?;

//     let lamports_per_sol_u128 = u128::try_from(LAMPORTS_PER_SOL).or(Err(Errors::Overflow))?;

//     let s: u128 = part1
//         .checked_mul(lamports_per_sol_u128)
//         .ok_or(Errors::Overflow)?
//         .checked_sub(r_u128.checked_mul(lamports_per_sol_u128).unwrap()) // check and change this 
//         .ok_or(Errors::Underflow)?;
    
//     Ok(s as u64)

// }

//  recheck bonding curve formula
// cpmm to radium 