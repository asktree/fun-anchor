import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import chalk from "chalk";
import { IDL } from "../target/types/cyclops";

const nakh = new anchor.Wallet(Keypair.generate());
console.log(chalk.blueBright(nakh.publicKey.toString()));

const connection = new Connection("http://127.0.0.1:8899");

const provider = new anchor.Provider(connection, nakh, {});

const program = new anchor.Program(
  IDL,
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  provider
);

const script = async () => {
  const signature = await connection.requestAirdrop(
    nakh.publicKey,
    1 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature);

  const me = program.provider.wallet.publicKey;

  const [counter, _] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("counter")],
    program.programId
  );

  const txId = await program.rpc.initialize({
    accounts: {
      systemProgram: SystemProgram.programId,
      user: me,
      counter,
    },
  });
  console.log("Your transaction signature", txId);

  const counterAccount = await program.account.counter.fetch(counter);

  const tx2 = await program.rpc.increment({
    accounts: { counter },
  });

  const tx3 = await program.rpc.set(new anchor.BN(3), {
    accounts: {
      counter,
      user: me,
    },
  });
};
script();
