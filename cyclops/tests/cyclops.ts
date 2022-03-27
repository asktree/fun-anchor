import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { Cyclops } from "../target/types/cyclops";

describe("cyclops", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Cyclops as Program<Cyclops>;

  it("Initializes to zero and increments to 1", async () => {
    // Add your test here.
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
    assert(counterAccount.value.toNumber() === 0, "counter value is zero");

    const tx2 = await program.rpc.increment({
      accounts: { counter },
    });

    assert(
      (await program.account.counter.fetch(counter)).value.toNumber() === 1,
      "counter value is one"
    );

    const tx3 = await program.rpc.set(new anchor.BN(3), {
      accounts: {
        counter,
        user: me,
      },
    });

    assert(
      (await program.account.counter.fetch(counter)).value.toNumber() === 3,
      "counter value is three"
    );

    const dipshit = Keypair.generate();

    const result = await program.rpc
      .set(new anchor.BN(3), {
        accounts: {
          counter,
          user: dipshit.publicKey,
        },
        signers: [dipshit],
      })
      .catch((e) => "it failed");

    assert(result === "it failed", "non-admin user can't use set");
  });
});
