use crate::constants::*;
use crate::errors::Errors;



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
