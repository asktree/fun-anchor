use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod cyclops {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.value = 0;
        counter.admin = *ctx.accounts.user.key;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.value += 1;
        Ok(())
    }

    pub fn set(ctx: Context<Set>, new_value: u64) -> Result<()> {
        let user_key = *ctx.accounts.user.key;
        let counter = &mut ctx.accounts.counter;

        require!(user_key == counter.admin, CustomError::NonAdminError);

        counter.value = new_value;
        Ok(())
    }
}

#[error_code]
pub enum CustomError {
    #[msg("The user is not the admin for this counter")]
    NonAdminError,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, seeds = [b"counter"], bump)]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct Set<'info> {
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"counter"], bump)]
    pub counter: Account<'info, Counter>,
}

#[account]
#[derive(Default)]
pub struct Counter {
    value: u64,
    admin: Pubkey,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(init, payer = user, seeds = [b"counter"], bump)]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}
