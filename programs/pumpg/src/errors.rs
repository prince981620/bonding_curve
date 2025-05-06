use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("Bonding curve is already complete")]
    BondingCurveComplete,
    #[msg("Bonding curve is not complete yet")]
    BondingCurveNotComplete,
    #[msg("Not authorized to perform this action")]
    NotAuthorized,
    #[msg("Insufficient tokens in bonding curve reserve")]
    InsufficientTokens,
    #[msg("Slippage: Too much SOL required")]
    TooMuchSolRequired,
    #[msg("Slippage: Too little SOL received")]
    TooLittleSolReceived,
    #[msg("Arithmetic overflow occurred")]
    Overflow,
    #[msg("Arithmetic underflow occurred")]
    Underflow,
    #[msg("Invalid calculation parameters")]
    InvalidCalculation,
    #[msg("Invalid Fee Account")]
    InvalidFeeAccount,
}
