/**
 * SUBSCRIBER
 * Look out for:
 * - Newly created accounts: add them to the DB
 * - New transactions: update the account record in DB
 *   */

import { CreateAccount } from "#Services/Account.service.js";
import { account, vaultId, lqPriceCalc } from "./utils.js";

(async () => {
  console.log(await account.getBalance({ tokenId: 62281549 }));
  console.log("Subscribing to vault events...");
  await account.subscribeToEvents({
    vaultId,
    createCallback: async (address, vaultState) => {
      console.log("New Account created!!");

      // Calculate liquidating price
      const lqPrice = lqPriceCalc({
        vaultDebt: vaultState.vaultDebt,
        collateral: vaultState.collateral,
      });

      // Store data in DB
      const status = await CreateAccount({ address, lqPrice });
      console.log(status);
    },
    transactionCallback: async (address, vaultState) => {
      console.log("New transaction detected!!");

      // Calculate liquidating price
      const lqPrice = lqPriceCalc({
        vaultDebt: vaultState.vaultDebt,
        collateral: vaultState.collateral,
      });

      // Store data in DB
      const status = await CreateAccount({ address, lqPrice });
      console.log(status);
    },
  });
})().catch((e) => console.log(e));
