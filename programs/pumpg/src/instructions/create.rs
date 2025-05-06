use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, metadata::{
    mpl_token_metadata::{
        instructions::{
            CreateMetadataAccountV3Cpi, CreateMetadataAccountV3CpiAccounts,
            CreateMetadataAccountV3InstructionArgs,
        },
        types::DataV2,
    },
    Metadata,
}, token::{self, Mint, Token, TokenAccount}};
use crate::constants::*;
use crate::state::{BondingCurve, Global};
use crate::events::TokenCreated;

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 6,
        mint::authority = bonding_curve
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = payer,
        space = 8 + BondingCurve::INIT_SPACE,
        seeds = [b"boding-curve", mint.key().as_ref()],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = bonding_curve
    )]
    pub bonding_curve_ata: Account<'info, TokenAccount>,

    #[account(seeds = [b"global"], bump=global.bump)]
    pub global: Account<'info, Global>,
    /// CHECK: New Metaplex Account being created
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    pub mpl_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

impl<'info> Create<'info> {
    pub fn create_token(&mut self, name: String, symbol: String, uri: String, bump:u8) -> Result<()> {
        // Create metadata

        let seeds = &[
            &b"bonding-curve"[..],
            &self.mint.key().to_bytes()[..],
            &[bump],
        ];

        let signer_seeds = &[&seeds[..]];


        let metadata = &self.metadata.to_account_info();
        let mint = &self.mint.to_account_info();
        let mint_authority = &self.bonding_curve.to_account_info();
        let payer = &self.payer.to_account_info();
        let update_authority = &self.bonding_curve.to_account_info();
        let system_program = &self.system_program.to_account_info();
        let token_metadata_program = &self.mpl_metadata_program.to_account_info();
        let name1 = name.clone();
        let symbol1 = symbol.clone();
        let uri1 = uri.clone();

        CreateMetadataAccountV3Cpi::new(
            token_metadata_program,
            CreateMetadataAccountV3CpiAccounts {
                metadata,
                mint,
                mint_authority,
                update_authority: (update_authority, true),
                payer,
                system_program,
                rent: None,
            },
            CreateMetadataAccountV3InstructionArgs {
                data: DataV2 {
                    name,
                    symbol,
                    uri,
                    seller_fee_basis_points: 0,
                    creators: None,
                    collection: None,
                    uses: None,
                },
                is_mutable: true,
                collection_details: None,
            },
        )
        .invoke_signed(signer_seeds)?;
    
        // CreateMetadataAccountV3CpiBuilder::new(&self.mpl_metadata_program)
        //     .metadata(&self.metadata)
        //     .mint(&self.mint)
        //     .mint_authority(&self.bonding_curve)
        //     .payer(&self.payer)
        //     .update_authority(&self.bonding_curve, true)
        //     .system_program(&self.system_program)
        //     .is_mutable(true)
        //     .rent(Some(&self.rent))
        //     .data(DataV2 {
        //         name,
        //         symbol,
        //         uri,
        //         seller_fee_basis_points: 0,
        //         creators: None,
        //         collection: None,
        //         uses: None,
        //     })
        //     .invoke_signed(&[&[
        //         BondingCurve::SEED,
        //         self.mint.key().as_ref(),
        //         &[self.bumps.bonding_curve],
        //     ]])?;

        // Mint tokens
        token::mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                token::MintTo {
                    authority: self.bonding_curve.to_account_info(),
                    mint: self.mint.to_account_info(),
                    to: self.bonding_curve_ata.to_account_info(),
                },
                signer_seeds, // check if it need same signer
            ),
            TOTAL_SUPPLY,
        )?;

        // Revoke mint authority
        token::set_authority(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                token::SetAuthority {
                    account_or_mint: self.mint.to_account_info(),
                    current_authority: self.bonding_curve.to_account_info(),
                },
                signer_seeds,
            ),
            token::spl_token::instruction::AuthorityType::MintTokens,
            None,
        )?;

        self.bonding_curve.set_inner(BondingCurve {
            virtual_token_reserve: self.global.initial_virtual_token_reserves,
            virtual_sol_reserve: self.global.initial_virtual_sol_reserves,
            real_token_reserve: self.global.initial_real_token_reserves,
            real_sol_reserve: 0,
            token_total_supply: self.global.token_total_supply,
            complete: false,
            total_tokens_sold: 0,
            total_lamports_spent: 0,
            bump,
        });

        emit!(TokenCreated {
            mint: self.mint.key(),
            bonding_curve: self.bonding_curve.key(),
            user: self.payer.key(),
            name: name1,
            symbol: symbol1,
            uri : uri1,
        });

        Ok(())
    }
}