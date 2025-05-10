import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Pumpg } from "../target/types/pumpg";
import { Commitment, Keypair, LAMPORTS_PER_SOL, PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
const commitment: Commitment = "confirmed";
import wallet from "../Admin-wallet.json";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createMint, getAssociatedTokenAddress, getAssociatedTokenAddressSync, getMint, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";

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

  const provider = anchor.getProvider();
  const connection = provider.connection;

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



  const admin = Keypair.fromSecretKey(new Uint8Array(wallet));

  const [coindev, buyer1, buyer2] = Array.from({length: 3}, ()=>
    Keypair.generate()
  );

  const global = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL)],
    program.programId
  )[0];

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  let mint: PublicKey;
  let bonding_curve: PublicKey;
  let vault: PublicKey;
  let bonding_curve_ata: PublicKey;
  let metadata: PublicKey;
  let devAta: PublicKey;
  let buyer1Ata: PublicKey;
  let buyer2Ata: PublicKey;
  let admin_ata: PublicKey;

  const mintadd = Keypair.generate();
  
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

    bonding_curve = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE), mintadd.publicKey.toBuffer()],
      program.programId
    )[0];

    vault = PublicKey.findProgramAddressSync(
      [Buffer.from(CURVE_VAULT), mintadd.publicKey.toBuffer()],
      program.programId
    )[0];

    mint = await createMint(
      connection,
      coindev,
      bonding_curve,
      null,
      6,
      mintadd
    );

    bonding_curve_ata = await getAssociatedTokenAddress(mint, bonding_curve, true);
  
    metadata = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    devAta = (await getOrCreateAssociatedTokenAccount(
      connection,
      coindev,
      mint,
      coindev.publicKey
    )).address;

    buyer1Ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      buyer1,
      mint,
      buyer1.publicKey
    )).address;

    buyer2Ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      buyer2,
      mint,
      buyer2.publicKey
    )).address;

    admin_ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      admin,
      mint,
      admin.publicKey
    )).address;
  
  
    console.log("Admin public key:", admin.publicKey.toBase58());
    console.log("Coindev public key:", coindev.publicKey.toBase58());
    console.log("mintadd.publickey", mintadd.publicKey.toBase58())
    console.log("Coin Mint Address:", mint);
    console.log("buyer1 public key:", buyer1.publicKey.toBase58());
  
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().accountsStrict({
      global: global,
      user: admin.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([admin])
    .rpc()
    // .then(confirm)
    // .then;
    console.log("Your transaction signature", tx);

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
      "Test",
      "$TEST",
      "www.uri.com",
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
    .signers([coindev])
    .rpc()
    // .then(confirm)
    // .then(log);

    console.log("create tx", tx);

  })

  it("Dev buy coin", async ()=> {

    

    const initalSOl = await connection.getBalance(coindev.publicKey);
    console.log("inital sol",initalSOl);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL);

    
    // const initialBondingCurve = await program.account.bondingCurve.fetch(
    //   bonding_curve
    // );
    // const initialBondingCurveLamports = await provider.connection.getBalance(
    //   bonding_curve
    // );
    // const initialBondingCurveATA =
    //   await provider.connection.getTokenAccountBalance(bonding_curve_ata);


    const amount = new anchor.BN(66_930_000_000_000); // 1 M token as decimal = 6
    const maxsolcost = new anchor.BN(2_000_000_000); // 1 sol
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
    console.log("final sol",finalSOl);

    console.log("sol used : ",initalSOl - finalSOl);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl);

    console.log("valut sol added :", finalVaultSOl - vaultSOL);

    console.log("--------------------------------- end of dev tx")
  })

  it("buyer1 buy coin", async ()=> {

    const buyer1_ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      buyer1,
      mint,
      buyer1.publicKey
    )).address;

    const initalSOl = await connection.getBalance(buyer1.publicKey);
    console.log("inital sol",initalSOl);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL);

    
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
    console.log("final sol",finalSOl);

    console.log("sol used : ",initalSOl - finalSOl);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl);

    console.log("valut sol added :", finalVaultSOl - vaultSOL);

    console.log("--------------------------------- end of buyer1 tx")
  })

  it("buyer2 buy coin", async ()=> {

    const buyer2_ata = (await getOrCreateAssociatedTokenAccount(
      connection,
      buyer2,
      mint,
      buyer2.publicKey
    )).address;

    const initalSOl = await connection.getBalance(buyer2.publicKey);
    console.log("inital sol",initalSOl);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL);

    
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
    console.log("final sol",finalSOl);

    console.log("sol used : ",initalSOl - finalSOl);

    const FinalFee = await connection.getBalance(admin.publicKey);
    console.log("final fee",FinalFee);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl);

    console.log("valut sol added :", finalVaultSOl - vaultSOL);

    console.log("--------------------------------- end of buyer2 tx")

  })

  it("Dev sell all", async ()=>{
    const initalSOl = await connection.getBalance(coindev.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL);

    const amount = new anchor.BN(66_930_000_000_000); // 1 M token as decimal = 6
    const minSolOutput = new anchor.BN(2_800_000_000);

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
    console.log("final fee",FinalFee);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl);

    console.log("valut sol transferred :", vaultSOL - finalVaultSOl);

    console.log("--------------------------------- end of tx")
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
    console.log("final fee",FinalFee);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl);

    console.log("valut sol transferred :", vaultSOL - finalVaultSOl);

    console.log("--------------------------------- end of tx")
  })
  it("buyer1 sell all", async ()=>{
    const initalSOl = await connection.getBalance(buyer1.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL);

    const amount = new anchor.BN(84_680_000_000_000); // 1 M token as decimal = 6
    const minSolOutput = new anchor.BN(2_500_000_000);

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
    console.log("final fee",FinalFee);

    console.log("fee paid : ", Number(FinalFee - initalFee)/LAMPORTS_PER_SOL);

    const finalVaultSOl = await connection.getBalance(vault);
    console.log("final vault : ", finalVaultSOl);

    console.log("valut sol transferred :", vaultSOL - finalVaultSOl);

    console.log("--------------------------------- end of tx")
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

  xit("set Params with wrong admin it should fail",async ()=>{

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
      .signers([coindev]) 
      .rpc();

    console.log("set params tx", tx);
    console.log("global state :", globalState);

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

  xit("failed withdraw sol and token for cpi to radium by non admin", async ()=>{

    const initalSOl = await connection.getBalance(buyer1.publicKey);
    console.log("inital sol",initalSOl/LAMPORTS_PER_SOL);

    const initalFee = await connection.getBalance(admin.publicKey);
    console.log("inital fee",initalFee);

    const vaultSOL = await connection.getBalance(vault);
    console.log("initial vault : ", vaultSOL);

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
  })


  after("cleanup event listeners", async () => {
    for (const id of listenerIds) {
      await program.removeEventListener(id);
    }
  });
 
});
