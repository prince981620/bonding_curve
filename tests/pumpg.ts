import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Pumpg } from "../target/types/pumpg";
import { Commitment, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
const commitment: Commitment = "confirmed";
import wallet from "../Admin-wallet.json";
import user from "../Users-wallet.json"
import coindDevWallet from "../coinDev-wallet.json"
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createMint, createMintToCheckedInstruction, getAssociatedTokenAddress, getAssociatedTokenAddressSync, getMint, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { xit } from "mocha";
import { expect } from "chai";

describe("pumpg", async () => {

    // Helper function to log a message  
    const log = async (signature: string): Promise<string> => {
      console.log(
        `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}\n`
      );
      return signature;
    };
  
    const confirmTx = async (signature: string) => {
      const latestBlockhash = await anchor.getProvider().connection.getLatestBlockhash();
      await anchor.getProvider().connection.confirmTransaction(
        {
          signature,
          ...latestBlockhash,
        },
        commitment
      )
    }
  
    const confirmTxs = async (signatures: string[]) => {
      await Promise.all(signatures.map(confirmTx))
    }

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.pumpg as Program<Pumpg>;

  console.log("program id",program.programId);

  const provider = anchor.getProvider();
  const connection = provider.connection;

  console.log("connection", connection.rpcEndpoint);

    // Helper function to log the transaction signature
    const confirm = async (signature: string): Promise<string> => {
      const block = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...block,
      });
      await log(signature);
      return signature;
    };

  // pub const GLOBAL: &[u8] = b"global";

  // pub const BONDING_CURVE : &[u8] = b"bonding_curve";

  const GLOBAL:string = "global";

  const BONDING_CURVE:string = "bonding_curve";

  const CURVE_VAULT:string = "curve-vault";

  // Address of the Raydium Cpmm program on devnet
  const CPMM_PROGRAM_ID = new anchor.web3.PublicKey(
    "SegaXNnoXYTZiqUt9Xn2XqGcL56b25yzXLuJSpadcMu"
  );
  // Address of the Locking CPMM program on devnet
  const LOCK_CPMM_PROGRAM_ID = new anchor.web3.PublicKey(
    "LockrWmn6K5twhz3y9w1dQERbmgSaRkfnTeTKbpofwE"
  );

  // Address of the Locking CPMM program on devnet
  const LOCK_CPMM_AUTHORITY_ID = new anchor.web3.PublicKey(
    "3f7GcQFG397GAaEnv51zR6tsTVihYRydnydDD1cXekxH"
  );

  // Address of the Raydium AMM configuration account on mainnet
  const AMM_CONFIG_ID = new anchor.web3.PublicKey(
    "BjZxF9CnEuR1vxXffJwun81i3Doe2C2vQCdJpShxCieM"
  );

  const MEMO_PROGRAM = new anchor.web3.PublicKey(
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
  );

  // Address of the Rent program
  const RENT_PROGRAM = anchor.web3.SYSVAR_RENT_PUBKEY;

  // Create pool fee receiver
  // Mainnet DNXgeM9EiiaAbaWvwjHj9fQQLAX5ZsfHyvmYUNRAdNC8
  // Devnet G11FKBRaAkHAKuLCgLM6K6NUc9rTjPAznRCjZifrTQe2
  const create_pool_fee = new anchor.web3.PublicKey(
    "BLxynZeHE123MmQgNJZiV1pwW4VYh46oZYyC66xwmtTY"
  );

  const WSOL_ID = new anchor.web3.PublicKey(
    "So11111111111111111111111111111111111111112"
  );

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );



  const admin = Keypair.fromSecretKey(new Uint8Array(wallet));

  // const user = Keypair.fromSecretKey()

  console.log("admin", admin.publicKey.toBase58());

  const [coindev, buyer1, buyer2] = Array.from({length: 3}, ()=>
    Keypair.generate()
  );

  // const coindev = Keypair.fromSecretKey(new Uint8Array(coindDevWallet));


  const global = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL)],
    program.programId
  )[0];

  console.log("global", global);

  const fee_receipent = new PublicKey("DKbqMnDju2ftYBKM65DhPMLi7foVt5QPmbCmeeTk5eSN");

  let mint: PublicKey;
  let bonding_curve: PublicKey;
  let vault: PublicKey;
  let bonding_curve_ata: PublicKey;
  let metadata: PublicKey;
  let devAta: PublicKey;
  let buyer1Ata: PublicKey;
  let buyer2Ata: PublicKey;
  let admin_ata: PublicKey;
  let admin_wsol_ata: PublicKey;
  
  const mintadd = Keypair.generate();


  console.log("mint :", mintadd.publicKey.toBase58());

  // const mintadd = new PublicKey("4vU4xV77PEozDhJBK4fu4WVqfRF7RKMZWDEkGEgkmdc7")
  
  let listenerIds: number[] = [];

  before(()=> {

    const InitializedListner = program.addEventListener("initialized", (event, slot, signature) => {
      console.log("Initialized Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(InitializedListner);

    const createEventListner = program.addEventListener("tokenCreated", (event, slot, signature) => {
      console.log("tokenCreated Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(createEventListner);

    const purchasedEvent = program.addEventListener("tokenPurchased", (event, slot, signature) => {
      console.log("tokenPurchased Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(purchasedEvent);

    const sellEventListner = program.addEventListener("tokenSold", (event, slot, signature) => {
      console.log("tokenSold Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(sellEventListner);



    const paramsSetEventListner = program.addEventListener("paramsSet", (event, slot, signature) => {
      console.log("paramsSet Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(paramsSetEventListner);

    const fundsWithdrawnEventListner = program.addEventListener("fundsWithdrawn", (event, slot, signature) => {
      console.log("fundsWithdrawn Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(fundsWithdrawnEventListner);
  })

  it("Airdrop and create Mints", async()=>{

    await Promise.all([admin, coindev, buyer1, buyer2].map(async (k) => {
      return await anchor.getProvider().connection.requestAirdrop(k.publicKey, 100 * anchor.web3.LAMPORTS_PER_SOL)
    })).then(confirmTxs);

    const balance = await connection.getBalance(admin.publicKey)
        console.log(`Balance: ${balance}`)

        // Create a test transaction to calculate fees
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: admin.publicKey,
                toPubkey: coindev.publicKey,
                lamports: 3*LAMPORTS_PER_SOL,
            })
        );
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        transaction.feePayer = admin.publicKey;

         // Sign transaction, broadcast, and confirm
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [admin]
        );
        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${signature}?cluster=devnet`)



    bonding_curve = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE), mintadd.publicKey.toBuffer()],
      program.programId
    )[0];

    console.log("bonding curve", bonding_curve);

    vault = PublicKey.findProgramAddressSync(
      [Buffer.from(CURVE_VAULT), mintadd.publicKey.toBuffer()],
      program.programId
    )[0];

    console.log("vault", vault);

    // mint = await createMint(
    //   connection,
    //   coindev,
    //   bonding_curve,
    //   null,
    //   6,
    //   mintadd
    // );

    mint = mintadd.publicKey;

    console.log("mint", mint);

    bonding_curve_ata = await getAssociatedTokenAddress(mint, bonding_curve, true);
  
    metadata = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];


    // buyer1Ata = (await getOrCreateAssociatedTokenAccount(
    //   connection,
    //   buyer1,
    //   mint,
    //   buyer1.publicKey
    // )).address;

    // buyer2Ata = (await getOrCreateAssociatedTokenAccount(
    //   connection,
    //   buyer2,
    //   mint,
    //   buyer2.publicKey
    // )).address;

  
  
    console.log("Admin public key:", admin.publicKey.toBase58());
    console.log("Coindev public key:", coindev.publicKey.toBase58());
    console.log("mintadd.publickey", mintadd.publicKey.toBase58())
    console.log("Coin Mint Address:", mint);
    // console.log("buyer1 public key:", buyer1.publicKey.toBase58());
  
  });

  it("Is initialized!", async () => {

    // const globalAccount = await program.account.global.fetchNullable(global);

    // if(globalAccount){
      console.log("not init we init now")
          // Add your test here.
    const tx = await program.methods.initialize().accountsStrict({
      global: global,
      user: admin.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([admin])
    .rpc()
    .then(confirm)
    .then(log)
    // .then(confirm)
    // .then;
    console.log("Your transaction signature", tx);
    // }else {
    //   console.log("Global account already initialized, skipping...");
    // }

  });

  it("create Coin", async()=> {

    console.log(
      "payer",coindev.publicKey,
      "mint", mint,
      "bondingCurve", bonding_curve,
      "bondingCurveAta", bonding_curve_ata,
      "global", global,
      "metadata", metadata,
      "mplMetadataProgram", TOKEN_METADATA_PROGRAM_ID,
      "associatedTokenProgram", ASSOCIATED_TOKEN_PROGRAM_ID,
      "tokenProgram", TOKEN_PROGRAM_ID,
      "rent", SYSVAR_RENT_PUBKEY,
      "systemProgram", anchor.web3.SystemProgram.programId
    );

    const tx = await program.methods.create(
      "L24DEVNET",
      "$L24DEVNET",
      "https://ipfs.io/ipfs/QmYfe8zVGHA1heej47AkBX3Nnetg2h2kqj5yymz1xyKeHb",
    ).accountsStrict({
      payer:coindev.publicKey,
      mint: mint,
      bondingCurve: bonding_curve,
      vault:vault,
      bondingCurveAta: bonding_curve_ata,
      global: global,
      metadata: metadata,
      mplMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([coindev,mintadd])
    .rpc()
    // .then(confirm)
    // .then(log);

    console.log("create tx", tx);

        // get initial bonding curve
    const initialBondingCurve_acc = await program.account.bondingCurve.fetch(
      bonding_curve
    );
    
    console.log("initial bonding curve  real sol-> ", (initialBondingCurve_acc.realSolReserve.toNumber())/LAMPORTS_PER_SOL); // 0
    console.log("initial bonding curve  virtual sol-> ", (initialBondingCurve_acc.virtualSolReserve.toNumber())/LAMPORTS_PER_SOL); // 30
    console.log("initial bonding curve  real token-> ", (initialBondingCurve_acc.realTokenReserve.toNumber())/1000000); // 793100000000000
    console.log("initial bonding curve  virtual token -> ", (initialBondingCurve_acc.virtualTokenReserve.toNumber())/1000000); // 30
    console.log("initial bonding curve  total token suppy-> ", (initialBondingCurve_acc.tokenTotalSupply.toNumber())/1000000); // 30


  })

  it("Dev buy coin", async ()=> {

    devAta = (await getOrCreateAssociatedTokenAccount(
      connection,
      coindev,
      mint,
      coindev.publicKey
    )).address;

    

    const initalSOl = await connection.getBalance(coindev.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee/LAMPORTS_PER_SOL);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL/LAMPORTS_PER_SOL);

    
    // const initialBondingCurve = await program.account.bondingCurve.fetch(
    //   bonding_curve
    // );
    // const initialBondingCurveLamports = await provider.connection.getBalance(
    //   bonding_curve
    // );
    // const initialBondingCurveATA =
    //   await provider.connection.getTokenAccountBalance(bonding_curve_ata);


    const amount = new anchor.BN(66_930_000_000_000); // 1 M token as decimal = 6
    const maxsolcost = new anchor.BN(2_500_000_000); // 1 sol
    const tx = await program.methods.buy(
      amount,
      maxsolcost
    )
    .accountsStrict({
      user: coindev.publicKey,
      global: global,
      feeRecipient: admin.publicKey,
      bondingCurve: bonding_curve,
      bondingCurveAta: bonding_curve_ata,
      vault: vault,
      userAta: devAta,
      mint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([coindev])
    .rpc()
    // .then(confirm)
    // .then(log);
    console.log("buy tx", tx);

    const token_balance = await connection.getTokenAccountBalance(devAta)
    console.log(Number(token_balance?.value?.amount)/1000000);

    const finalSOl = await connection.getBalance(coindev.publicKey);
    console.log("final sol",finalSOl/LAMPORTS_PER_SOL);

    console.log("sol used : ",(initalSOl - finalSOl)/LAMPORTS_PER_SOL);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee/LAMPORTS_PER_SOL);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl/LAMPORTS_PER_SOL);

    console.log("valut sol added :", (finalVaultSOl - vaultSOL)/LAMPORTS_PER_SOL);

    console.log("--------------------------------- end of dev tx")

    // get initial bonding curve
    const initialBondingCurve_acc = await program.account.bondingCurve.fetch(
      bonding_curve
    );
    
    console.log("initial bonding curve  real sol-> ", (initialBondingCurve_acc.realSolReserve.toNumber())/LAMPORTS_PER_SOL); // 0
    console.log("initial bonding curve  virtual sol-> ", (initialBondingCurve_acc.virtualSolReserve.toNumber())/LAMPORTS_PER_SOL); // 30
    console.log("initial bonding curve  real token-> ", (initialBondingCurve_acc.realTokenReserve.toNumber())/1000000); // 793100000000000
    console.log("initial bonding curve  virtual token -> ", (initialBondingCurve_acc.virtualTokenReserve.toNumber())/1000000); // 30
    console.log("initial bonding curve  total token suppy-> ", (initialBondingCurve_acc.tokenTotalSupply.toNumber())/1000000); // 30

  })

  it("get bondig curve state", async()=>{
    console.log("mint:",mintadd.publicKey)
    const mint = new anchor.web3.PublicKey(mintadd.publicKey);

    const bonding_curve = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE), mint.toBuffer()],
      program.programId
    )[0];

    console.log("bonding curve pda:", bonding_curve);

    // get initial bonding curve
    const initialBondingCurve_acc = await program.account.bondingCurve.fetch(
      bonding_curve
    );
    
    console.log("initial bonding curve  real sol-> ", (initialBondingCurve_acc.realSolReserve.toNumber())/LAMPORTS_PER_SOL); // 0
    console.log("initial bonding curve  virtual sol-> ", (initialBondingCurve_acc.virtualSolReserve.toNumber())/LAMPORTS_PER_SOL); // 30
    console.log("initial bonding curve  real token-> ", (initialBondingCurve_acc.realTokenReserve.toNumber())/1000000); // 793100000000000
    console.log("initial bonding curve  virtual token -> ", (initialBondingCurve_acc.virtualTokenReserve.toNumber())/1000000); // 30
    console.log("initial bonding curve  total token suppy-> ", (initialBondingCurve_acc.tokenTotalSupply.toNumber())/1000000); // 30
  })

  it("buyer1 buy coin", async ()=> {

    const buyer1_ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      buyer1,
      mint,
      buyer1.publicKey
    )).address;

    const initalSOl = await connection.getBalance(buyer1.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee/LAMPORTS_PER_SOL);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL/LAMPORTS_PER_SOL);

    
    // const initialBondingCurve = await program.account.bondingCurve.fetch(
    //   bonding_curve
    // );
    // const initialBondingCurveLamports = await provider.connection.getBalance(
    //   bonding_curve
    // );
    // const initialBondingCurveATA =
    //   await provider.connection.getTokenAccountBalance(bonding_curve_ata);


    const amount = new anchor.BN(84_680_000_000_000); // 1 M token as decimal = 6
    const maxsolcost = new anchor.BN(3_000_000_000); // 1 sol
    const tx = await program.methods.buy(
      amount,
      maxsolcost
    )
    .accountsStrict({
      user: buyer1.publicKey,
      global: global,
      feeRecipient: admin.publicKey,
      bondingCurve: bonding_curve,
      vault: vault,
      bondingCurveAta: bonding_curve_ata,
      userAta: buyer1_ata,
      mint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([buyer1])
    .rpc()
    // .then(confirm)
    // .then(log);
    console.log("buy tx", tx);

    const token_balance = await connection.getTokenAccountBalance(buyer1_ata)
    console.log(Number(token_balance?.value?.amount)/1000000);

    const finalSOl = await connection.getBalance(buyer1.publicKey);
    console.log("final sol",finalSOl/LAMPORTS_PER_SOL);

    console.log("sol used : ",(initalSOl - finalSOl)/LAMPORTS_PER_SOL);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee/LAMPORTS_PER_SOL);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl/LAMPORTS_PER_SOL);

    console.log("valut sol added :", (finalVaultSOl - vaultSOL)/LAMPORTS_PER_SOL);

    console.log("--------------------------------- end of buyer1 tx")
  })

  it("get bondig curve state", async()=>{
    const mint = new anchor.web3.PublicKey(mintadd.publicKey);

    const bonding_curve = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE), mint.toBuffer()],
      program.programId
    )[0];

    console.log("bonding curve pda:", bonding_curve);

    // get initial bonding curve
    const initialBondingCurve_acc = await program.account.bondingCurve.fetch(
      bonding_curve
    );
    
    console.log("initial bonding curve  real sol-> ", (initialBondingCurve_acc.realSolReserve.toNumber())/LAMPORTS_PER_SOL); // 0
    console.log("initial bonding curve  virtual sol-> ", (initialBondingCurve_acc.virtualSolReserve.toNumber())/LAMPORTS_PER_SOL); // 30
    console.log("initial bonding curve  real token-> ", (initialBondingCurve_acc.realTokenReserve.toNumber())/1000000); // 793100000000000
    console.log("initial bonding curve  virtual token -> ", (initialBondingCurve_acc.virtualTokenReserve.toNumber())/1000000); // 30
    console.log("initial bonding curve  total token suppy-> ", (initialBondingCurve_acc.tokenTotalSupply.toNumber())/1000000); // 30
  })

  it("buyer2 buy coin", async ()=> {

    const buyer2_ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      buyer2,
      mint,
      buyer2.publicKey
    )).address;

    const initalSOl = await connection.getBalance(buyer2.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee/LAMPORTS_PER_SOL);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL/LAMPORTS_PER_SOL);

    
    // const initialBondingCurve = await program.account.bondingCurve.fetch(
    //   bonding_curve
    // );
    // const initialBondingCurveLamports = await provider.connection.getBalance(
    //   bonding_curve
    // );
    // const initialBondingCurveATA =
    //   await provider.connection.getTokenAccountBalance(bonding_curve_ata);


    const amount = new anchor.BN(78_080_000_000_000); // 1 M token as decimal = 6
    const maxsolcost = new anchor.BN(3_500_000_000); // 1 sol
    const tx = await program.methods.buy(
      amount,
      maxsolcost
    )
    .accountsStrict({
      user: buyer2.publicKey,
      global: global,
      feeRecipient: admin.publicKey,
      bondingCurve: bonding_curve,
      vault: vault,
      bondingCurveAta: bonding_curve_ata,
      userAta: buyer2_ata,
      mint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([buyer2])
    .rpc()
    // .then(confirm)
    // .then(log);
    console.log("buy tx", tx);

    const token_balance = await connection.getTokenAccountBalance(buyer2_ata)
    console.log(Number(token_balance?.value?.amount)/1000000);

    const finalSOl = await connection.getBalance(buyer2.publicKey);
    console.log("final sol",finalSOl/LAMPORTS_PER_SOL);

    console.log("sol used : ",(initalSOl - finalSOl)/LAMPORTS_PER_SOL);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee/LAMPORTS_PER_SOL);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl/LAMPORTS_PER_SOL);

    console.log("valut sol added :", (finalVaultSOl - vaultSOL)/LAMPORTS_PER_SOL);

    console.log("--------------------------------- end of buyer2 tx")

  })

  it("get bondig curve state", async()=>{
    const mint = new anchor.web3.PublicKey(mintadd.publicKey);

    const bonding_curve = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE), mint.toBuffer()],
      program.programId
    )[0];

    console.log("bonding curve pda:", bonding_curve);

    // get initial bonding curve
    const initialBondingCurve_acc = await program.account.bondingCurve.fetch(
      bonding_curve
    );
    
    console.log("initial bonding curve  real sol-> ", (initialBondingCurve_acc.realSolReserve.toNumber())/LAMPORTS_PER_SOL); // 0
    console.log("initial bonding curve  virtual sol-> ", (initialBondingCurve_acc.virtualSolReserve.toNumber())/LAMPORTS_PER_SOL); // 30
    console.log("initial bonding curve  real token-> ", (initialBondingCurve_acc.realTokenReserve.toNumber())/1000000); // 793100000000000
    console.log("initial bonding curve  virtual token -> ", (initialBondingCurve_acc.virtualTokenReserve.toNumber())/1000000); // 30
    console.log("initial bonding curve  total token suppy-> ", (initialBondingCurve_acc.tokenTotalSupply.toNumber())/1000000); // 30
  })

  it("Dev sell all", async ()=>{
    const initalSOl = await connection.getBalance(coindev.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee/LAMPORTS_PER_SOL);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL/LAMPORTS_PER_SOL);

    const amount = new anchor.BN(66_930_000_000_000); // 1 M token as decimal = 6
    const minSolOutput = new anchor.BN(1_000_000_000);

    const tx = await program.methods.sell(
      amount,
      minSolOutput
    )
    .accountsStrict({
      user: coindev.publicKey,
      global: global,
      feeRecipient: admin.publicKey,
      bondingCurve: bonding_curve,
      vault: vault,
      bondingCurveAta: bonding_curve_ata,
      userAta: devAta,
      mint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([coindev])
    .rpc()

    console.log("sell tx", tx);

    const token_balance = await connection.getTokenAccountBalance(devAta)
    console.log("TOken balance",Number(token_balance?.value?.amount)/1000000);

    const finalSOl = await connection.getBalance(coindev.publicKey);
    console.log("final sol",finalSOl/LAMPORTS_PER_SOL);

    console.log("sol received: ",(finalSOl - initalSOl)/LAMPORTS_PER_SOL);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee/LAMPORTS_PER_SOL);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl/LAMPORTS_PER_SOL);

    console.log("valut sol transferred :", (vaultSOL - finalVaultSOl)/LAMPORTS_PER_SOL);


    // try {
    //     // Get balance of dev wallet
    //     const balance = await connection.getBalance(coindev.publicKey)
    //     console.log(`Balance: ${balance}`)

    //     // Create a test transaction to calculate fees
    //     const transaction = new Transaction().add(
    //         SystemProgram.transfer({
    //             fromPubkey: coindev.publicKey,
    //             toPubkey: admin.publicKey,
    //             lamports: balance,
    //         })
    //     );
    //     transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
    //     transaction.feePayer = coindev.publicKey;

    //     // Calculate exact fee rate to transfer entire SOL amount out of account minus fees
    //     const fee = (await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed')).value || 0;


    //     // Remove our transfer instruction to replace it
    //     transaction.instructions.pop();

    //     // Now add the instruction back with correct amount of lamports
    //     transaction.add(
    //         SystemProgram.transfer({
    //             fromPubkey: coindev.publicKey,
    //             toPubkey: admin.publicKey,
    //             lamports: balance - fee,
    //         })
    //     );

    //     // Sign transaction, broadcast, and confirm
    //     const signature = await sendAndConfirmTransaction(
    //         connection,
    //         transaction,
    //         [coindev]
    //     );
    //     console.log(`Success! Check out your TX here: 
    //     https://explorer.solana.com/tx/${signature}?cluster=devnet`)
    // } catch(e) {
    //     console.error(`Oops, something went wrong: ${e}`)
    // }



    console.log("--------------------------------- end of tx")
  })

  it("get bondig curve state", async()=>{
    const mint = new anchor.web3.PublicKey(mintadd.publicKey);

    const bonding_curve = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE), mint.toBuffer()],
      program.programId
    )[0];

    console.log("bonding curve pda:", bonding_curve);

    // get initial bonding curve
    const initialBondingCurve_acc = await program.account.bondingCurve.fetch(
      bonding_curve
    );
    
    console.log("initial bonding curve  real sol-> ", (initialBondingCurve_acc.realSolReserve.toNumber())/LAMPORTS_PER_SOL); // 0
    console.log("initial bonding curve  virtual sol-> ", (initialBondingCurve_acc.virtualSolReserve.toNumber())/LAMPORTS_PER_SOL); // 30
    console.log("initial bonding curve  real token-> ", (initialBondingCurve_acc.realTokenReserve.toNumber())/1000000); // 793100000000000
    console.log("initial bonding curve  virtual token -> ", (initialBondingCurve_acc.virtualTokenReserve.toNumber())/1000000); // 30
    console.log("initial bonding curve  total token suppy-> ", (initialBondingCurve_acc.tokenTotalSupply.toNumber())/1000000); // 30
  })

  it("buyer 2 sell all", async ()=>{
    const initalSOl = await connection.getBalance(buyer2.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee/LAMPORTS_PER_SOL);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL/LAMPORTS_PER_SOL);

    const amount = new anchor.BN(78_080_000_000_000); // 1 M token as decimal = 6
    const minSolOutput = new anchor.BN(2_700_000_000);

    const buyer2Ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      buyer2,
      mint,
      buyer2.publicKey
    )).address;

    const tx = await program.methods.sell(
      amount,
      minSolOutput
    )
    .accountsStrict({
      user: buyer2.publicKey,
      global: global,
      feeRecipient: admin.publicKey,
      bondingCurve: bonding_curve,
      vault: vault,
      bondingCurveAta: bonding_curve_ata,
      userAta: buyer2Ata,
      mint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([buyer2])
    .rpc()

    console.log("sell tx", tx);

    const token_balance = await connection.getTokenAccountBalance(buyer2Ata)
    console.log("TOken balance",Number(token_balance?.value?.amount)/1000000);

    const finalSOl = await connection.getBalance(buyer2.publicKey);
    console.log("final sol",finalSOl/LAMPORTS_PER_SOL);

    console.log("sol received: ",(finalSOl - initalSOl)/LAMPORTS_PER_SOL);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee/LAMPORTS_PER_SOL);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl/LAMPORTS_PER_SOL);

    console.log("valut sol transferred :", (vaultSOL - finalVaultSOl)/LAMPORTS_PER_SOL);

    console.log("--------------------------------- end of tx")
  })

  it("get bondig curve state", async()=>{
    const mint = new anchor.web3.PublicKey(mintadd.publicKey);

    const bonding_curve = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE), mint.toBuffer()],
      program.programId
    )[0];

    console.log("bonding curve pda:", bonding_curve);

    // get initial bonding curve
    const initialBondingCurve_acc = await program.account.bondingCurve.fetch(
      bonding_curve
    );
    
    console.log("initial bonding curve  real sol-> ", (initialBondingCurve_acc.realSolReserve.toNumber())/LAMPORTS_PER_SOL); // 0
    console.log("initial bonding curve  virtual sol-> ", (initialBondingCurve_acc.virtualSolReserve.toNumber())/LAMPORTS_PER_SOL); // 30
    console.log("initial bonding curve  real token-> ", (initialBondingCurve_acc.realTokenReserve.toNumber())/1000000); // 793100000000000
    console.log("initial bonding curve  virtual token -> ", (initialBondingCurve_acc.virtualTokenReserve.toNumber())/1000000); // 30
    console.log("initial bonding curve  total token suppy-> ", (initialBondingCurve_acc.tokenTotalSupply.toNumber())/1000000); // 30
  })


  it("buyer1 sell all", async ()=>{
    const initalSOl = await connection.getBalance(buyer1.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee/LAMPORTS_PER_SOL);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL/LAMPORTS_PER_SOL);

    const amount = new anchor.BN(84_680_000_000_000); // 1 M token as decimal = 6
    const minSolOutput = new anchor.BN(2_500_000_000);

    const buyer1Ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      buyer1,
      mint,
      buyer1.publicKey
    )).address;

    const tx = await program.methods.sell(
      amount,
      minSolOutput
    )
    .accountsStrict({
      user: buyer1.publicKey,
      global: global,
      feeRecipient: admin.publicKey,
      bondingCurve: bonding_curve,
      vault: vault,
      bondingCurveAta: bonding_curve_ata,
      userAta: buyer1Ata,
      mint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([buyer1])
    .rpc()

    console.log("sell tx", tx);

    const token_balance = await connection.getTokenAccountBalance(buyer1Ata)
    console.log("TOken balance",Number(token_balance?.value?.amount)/1000000);

    const finalSOl = await connection.getBalance(buyer1.publicKey);
    console.log("final sol",finalSOl/LAMPORTS_PER_SOL);

    console.log("sol received: ",(finalSOl - initalSOl)/LAMPORTS_PER_SOL);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee/LAMPORTS_PER_SOL);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl/LAMPORTS_PER_SOL);

    console.log("valut sol transferred :", (vaultSOL - finalVaultSOl)/LAMPORTS_PER_SOL);

    console.log("--------------------------------- end of tx")
  })


  it("get bondig curve state", async()=>{
    const mint = new anchor.web3.PublicKey(mintadd.publicKey);

    const bonding_curve = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE), mint.toBuffer()],
      program.programId
    )[0];

    console.log("bonding curve pda:", bonding_curve);

    // get initial bonding curve
    const initialBondingCurve_acc = await program.account.bondingCurve.fetch(
      bonding_curve
    );
    
    console.log("initial bonding curve  real sol-> ", (initialBondingCurve_acc.realSolReserve.toNumber())/LAMPORTS_PER_SOL); // 0
    console.log("initial bonding curve  virtual sol-> ", (initialBondingCurve_acc.virtualSolReserve.toNumber())/LAMPORTS_PER_SOL); // 30
    console.log("initial bonding curve  real token-> ", (initialBondingCurve_acc.realTokenReserve.toNumber())/1000000); // 793100000000000
    console.log("initial bonding curve  virtual token -> ", (initialBondingCurve_acc.virtualTokenReserve.toNumber())/1000000); // 30
    console.log("initial bonding curve  total token suppy-> ", (initialBondingCurve_acc.tokenTotalSupply.toNumber())/1000000); // 30
  })

  xit("set Params",async ()=>{

    const feeRecipient = Keypair.generate();

    const globalState = await program.account.global.fetch(global);

    console.log("global state :", globalState);

    const tx = await program.methods
      .setParams(
        feeRecipient.publicKey,
        new anchor.BN(globalState.initialVirtualTokenReserves),
        new anchor.BN(globalState.initialVirtualSolReserves),
        new anchor.BN(globalState.initialRealTokenReserves),
        new anchor.BN(globalState.tokenTotalSupply),
        new anchor.BN(globalState.feeBasisPoints)
      )
      .accountsStrict({
        global: global,
        user: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin]) 
      .rpc();

    console.log("set params tx", tx);
    console.log("global state :", globalState);

  })

  it("set Params with wrong admin it should fail",async ()=>{

    const feeRecipient = Keypair.generate();

    const globalState = await program.account.global.fetch(global);

    console.log("global state :", globalState);

    try {
      const tx = await program.methods
      .setParams(
        feeRecipient.publicKey,
        new anchor.BN(globalState.initialVirtualTokenReserves),
        new anchor.BN(globalState.initialVirtualSolReserves),
        new anchor.BN(globalState.initialRealTokenReserves),
        new anchor.BN(globalState.tokenTotalSupply),
        new anchor.BN(globalState.feeBasisPoints)
      )
      .accountsStrict({
        global: global,
        user: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([coindev]) 
      .rpc();

    console.log("set params tx", tx);
    console.log("global state :", globalState);
    }catch(e){
      expect(e).to.exist;
    }

  })


  xit("withdraw sol and token for cpi to radium", async ()=>{

    const initalSOl = await connection.getBalance(admin.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL);

    let tx = await program.methods
      .withdraw()
      .accountsStrict({
        authority: admin.publicKey,
        global: global,
        feeRecipient: admin.publicKey,
        bondingCurve: bonding_curve,
        vault: vault,
        bondingCurveAta: bonding_curve_ata,
        userAta: admin_ata,
        mint: mintadd.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([admin])
      .rpc()

      console.log("withdraw tx:", tx);

      const token_balance = await connection.getTokenAccountBalance(admin_ata)
    console.log("TOken balance",Number(token_balance?.value?.amount)/1000000);

    const finalSOl = await connection.getBalance(admin.publicKey);
    console.log("final sol",finalSOl/LAMPORTS_PER_SOL);

    console.log("sol received: ",(finalSOl - initalSOl)/LAMPORTS_PER_SOL);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl);

    console.log("valut sol transferred :", vaultSOL - finalVaultSOl);

    console.log("--------------------------------- end of tx")
  })

  it("failed withdraw sol and token for cpi to radium by non admin", async ()=>{

    const initalSOl = await connection.getBalance(buyer1.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL);

    try {
      let tx = await program.methods
      .withdraw()
      .accountsStrict({
        authority: buyer1.publicKey,
        global: global,
        feeRecipient: admin.publicKey,
        bondingCurve: bonding_curve,
        vault: vault,
        bondingCurveAta: bonding_curve_ata,
        userAta: buyer1Ata,
        mint: mintadd.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([buyer1])
      .rpc()

      console.log("withdraw tx:", tx);

      const token_balance = await connection.getTokenAccountBalance(admin_ata)
    console.log("TOken balance",Number(token_balance?.value?.amount)/1000000);

    const finalSOl = await connection.getBalance(admin.publicKey);
    console.log("final sol",finalSOl/LAMPORTS_PER_SOL);

    console.log("sol received: ",(finalSOl - initalSOl)/LAMPORTS_PER_SOL);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl);

    console.log("valut sol transferred :", vaultSOL - finalVaultSOl);

    console.log("--------------------------------- end of tx")

    }catch(e) {
      expect(e).to.exist;
    }

      })

  it("Dev buy coin again to migrate", async ()=> {

    devAta = (await getOrCreateAssociatedTokenAccount(
      connection,
      coindev,
      mint,
      coindev.publicKey
    )).address;

    

    const initalSOl = await connection.getBalance(coindev.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee/LAMPORTS_PER_SOL);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL/LAMPORTS_PER_SOL);

    
    // const initialBondingCurve = await program.account.bondingCurve.fetch(
    //   bonding_curve
    // );
    // const initialBondingCurveLamports = await provider.connection.getBalance(
    //   bonding_curve
    // );
    // const initialBondingCurveATA =
    //   await provider.connection.getTokenAccountBalance(bonding_curve_ata);


    const amount = new anchor.BN(793_200_000_000_000); // 1 M token as decimal = 6
    const maxsolcost = new anchor.BN(90_000_000_000); // 1 sol
    const tx = await program.methods.buy(
      amount,
      maxsolcost
    )
    .accountsStrict({
      user: coindev.publicKey,
      global: global,
      feeRecipient: admin.publicKey,
      bondingCurve: bonding_curve,
      bondingCurveAta: bonding_curve_ata,
      vault: vault,
      userAta: devAta,
      mint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([coindev])
    .rpc()
    // .then(confirm)
    // .then(log);
    console.log("buy tx", tx);

    const token_balance = await connection.getTokenAccountBalance(devAta)
    console.log(Number(token_balance?.value?.amount)/1000000);

    const finalSOl = await connection.getBalance(coindev.publicKey);
    console.log("final sol",(finalSOl)/LAMPORTS_PER_SOL);

    console.log("sol used : ",(initalSOl - finalSOl)/LAMPORTS_PER_SOL);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee/LAMPORTS_PER_SOL);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl/LAMPORTS_PER_SOL);

    console.log("valut sol added :", (finalVaultSOl - vaultSOL)/LAMPORTS_PER_SOL);

    console.log("--------------------------------- end of dev tx")
  })

  it("get bondig curve state", async()=>{
    const mint = new anchor.web3.PublicKey(mintadd.publicKey);

    const bonding_curve = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE), mint.toBuffer()],
      program.programId
    )[0];

    console.log("bonding curve pda:", bonding_curve);

    // get initial bonding curve
    const initialBondingCurve_acc = await program.account.bondingCurve.fetch(
      bonding_curve
    );
    
    console.log("initial bonding curve  real sol-> ", (initialBondingCurve_acc.realSolReserve.toNumber())/LAMPORTS_PER_SOL); // 0
    console.log("initial bonding curve  virtual sol-> ", (initialBondingCurve_acc.virtualSolReserve.toNumber())/LAMPORTS_PER_SOL); // 30
    console.log("initial bonding curve  real token-> ", (initialBondingCurve_acc.realTokenReserve.toNumber())/1000000); // 793100000000000
    console.log("initial bonding curve  virtual token -> ", (initialBondingCurve_acc.virtualTokenReserve.toNumber())/1000000); // 30
    console.log("initial bonding curve  total token suppy-> ", (initialBondingCurve_acc.tokenTotalSupply.toNumber())/1000000); // 30
  })

  it("transfer and wrap sol", async ()=>{

    admin_ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      admin,
      mint,
      admin.publicKey
    )).address;

    admin_wsol_ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      admin,
      WSOL_ID,
      admin.publicKey
    )).address;

    let tx = await program.methods
          .transferAndWrapSol()
          .accountsStrict({
            authority: admin.publicKey,
            global: global,
            feeRecipient: fee_receipent,
            bondingCurve: bonding_curve,
            vault: vault,
            bondingCurveAta: bonding_curve_ata,
            userWsolAta: admin_wsol_ata,
            userAta: admin_ata,
            wsolMint: WSOL_ID,
            mint: mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId
          })
          .signers([admin])
          .rpc()
          // .then(confirm)
          // .then(log)
    console.log("transfer and wrap sol tx", tx);



    console.log("--------------------------------- end of tx")

  })

  it("get bondig curve state", async()=>{
    const mint = new anchor.web3.PublicKey(mintadd.publicKey);

    const bonding_curve = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE), mint.toBuffer()],
      program.programId
    )[0];

    console.log("bonding curve pda:", bonding_curve);

    // get initial bonding curve
    const initialBondingCurve_acc = await program.account.bondingCurve.fetch(
      bonding_curve
    );
    
    console.log("initial bonding curve  real sol-> ", (initialBondingCurve_acc.realSolReserve.toNumber())/LAMPORTS_PER_SOL); // 0
    console.log("initial bonding curve  virtual sol-> ", (initialBondingCurve_acc.virtualSolReserve.toNumber())/LAMPORTS_PER_SOL); // 30
    console.log("initial bonding curve  real token-> ", (initialBondingCurve_acc.realTokenReserve.toNumber())/1000000); // 793100000000000
    console.log("initial bonding curve  virtual token -> ", (initialBondingCurve_acc.virtualTokenReserve.toNumber())/1000000); // 30
    console.log("initial bonding curve  total token suppy-> ", (initialBondingCurve_acc.tokenTotalSupply.toNumber())/1000000); // 30
  })

  // xit("Migrate to Raydium", async()=>{
  //    // Pda address for the Raydium vault lp auth 
  //   const raydium_authority = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("vault_and_lp_mint_auth_seed"),
  //     ],
  //     CPMM_PROGRAM_ID
  //   )[0];

  //   // PDA address for the pool_state
  //   const pool_state = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("pool"),
  //       AMM_CONFIG_ID.toBuffer(),
  //       WSOL_ID.toBuffer(),
  //       mint.toBuffer()
  //     ],
  //     CPMM_PROGRAM_ID
  //   )[0];

  //   const lp_mint = PublicKey.findProgramAddressSync(
  //     [
  //     Buffer.from("pool_lp_mint"),
  //     pool_state.toBuffer()
  //     ],
  //     CPMM_PROGRAM_ID
  //   )[0];

  //   const admin_lp_ata = getAssociatedTokenAddressSync(lp_mint, admin.publicKey);

  //   const token_0_vault = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("pool_vault"),
  //       pool_state.toBuffer(),
  //       WSOL_ID.toBuffer(),
  //     ],
  //     CPMM_PROGRAM_ID
  //   )[0];

  //   const token_1_vault = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("pool_vault"),
  //       pool_state.toBuffer(),
  //       mint.toBuffer(),
  //     ],
  //     CPMM_PROGRAM_ID
  //   )[0];

  //   const observation_state = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("observation"),
  //       pool_state.toBuffer(),
  //     ],
  //     CPMM_PROGRAM_ID
  //   )[0];

  //   let tx = await program.methods
  //         .migrate()
  //         .accountsStrict({
  //           cpSwapProgram: CPMM_PROGRAM_ID,
  //           authority: admin.publicKey,
  //           mint: mint,
  //           baseMint: WSOL_ID,
  //           creatorBaseAta: admin_wsol_ata,
  //           createrTokenAta: admin_ata,
  //           ammConfig: AMM_CONFIG_ID,
  //           radiumAuthority: raydium_authority,
  //           poolState: pool_state,
  //           lpMint: lp_mint,
  //           creatorLpToken: admin_lp_ata,
  //           token0Vault: token_0_vault,
  //           token1Vault: token_1_vault,
  //           createPoolFee: create_pool_fee,
  //           observationState: observation_state,
  //           global: global,
  //           bondingCurve: bonding_curve,
  //           tokenProgram: TOKEN_PROGRAM_ID,
  //           associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //           systemProgram: anchor.web3.SystemProgram.programId,
  //           rent: anchor.web3.SYSVAR_RENT_PUBKEY
  //         })
  //         .signers([admin])
  //         .rpc()

  //         console.log("raydium migration tx :", tx);
  // })

  it("Migrate to sega", async()=>{
     // Pda address for the Raydium vault lp auth 
    const raydium_authority = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault_and_lp_mint_auth_seed"),
      ],
      CPMM_PROGRAM_ID
    )[0];

    // PDA address for the pool_state
    const pool_state = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        AMM_CONFIG_ID.toBuffer(),
        WSOL_ID.toBuffer(),
        mint.toBuffer()
      ],
      CPMM_PROGRAM_ID
    )[0];

    const lp_mint = PublicKey.findProgramAddressSync(
      [
      Buffer.from("pool_lp_mint"),
      pool_state.toBuffer()
      ],
      CPMM_PROGRAM_ID
    )[0];

    const admin_lp_ata = getAssociatedTokenAddressSync(lp_mint, admin.publicKey);

    const token_0_vault = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool_vault"),
        pool_state.toBuffer(),
        WSOL_ID.toBuffer(),
      ],
      CPMM_PROGRAM_ID
    )[0];

    const token_1_vault = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool_vault"),
        pool_state.toBuffer(),
        mint.toBuffer(),
      ],
      CPMM_PROGRAM_ID
    )[0];

    const observation_state = PublicKey.findProgramAddressSync(
      [
        Buffer.from("observation"),
        pool_state.toBuffer(),
      ],
      CPMM_PROGRAM_ID
    )[0];

    console.log({
            "cpSwapProgram": CPMM_PROGRAM_ID,
            "authority": admin.publicKey,
            "mint": mint,
            "baseMint": WSOL_ID,
            "creatorBaseAta": admin_wsol_ata,
            "createrTokenAta": admin_ata,
            "ammConfig": AMM_CONFIG_ID,
            "radiumAuthority": raydium_authority,
            "poolState": pool_state,
            "lpMint": lp_mint,
            "creatorLpToken": admin_lp_ata,
            "token0Vault": token_0_vault,
            "token1Vault": token_1_vault,
            "createPoolFee": create_pool_fee,
            "observationState": observation_state,
            "global": global,
            "bondingCurve": bonding_curve,
            "tokenProgram": TOKEN_PROGRAM_ID,
            "associatedTokenProgram": ASSOCIATED_TOKEN_PROGRAM_ID,
            "systemProgram": anchor.web3.SystemProgram.programId,
            "rent": anchor.web3.SYSVAR_RENT_PUBKEY
    })

    try {
          let tx = await program.methods
          .migrateSega()
          .accountsStrict({
            cpSwapProgram: CPMM_PROGRAM_ID,
            authority: admin.publicKey,
            mint: mint,
            baseMint: WSOL_ID,
            creatorBaseAta: admin_wsol_ata,
            createrTokenAta: admin_ata,
            ammConfig: AMM_CONFIG_ID,
            radiumAuthority: raydium_authority,
            poolState: pool_state,
            lpMint: lp_mint,
            creatorLpToken: admin_lp_ata,
            token0Vault: token_0_vault,
            token1Vault: token_1_vault,
            createPoolFee: create_pool_fee,
            observationState: observation_state,
            global: global,
            bondingCurve: bonding_curve,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY
          })
          .signers([admin])
          .rpc()

          // await provider.sendAndConfirm(tx);

          console.log("Sega migration tx :", tx);
    }catch(e){
      console.log("Error ::" , e);
    }
  })


  after("cleanup event listeners", async () => {
    for (const id of listenerIds) {
      await program.removeEventListener(id);
    }
  });
 
});
