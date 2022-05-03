/**
 * SUBSCRIBER
 * Look out for:
 * - Newly created accounts: add them to the DB
 * - New transactions: update the account record in DB
 *   */

import { CreateAccount } from "#Services/Account.service.js";
import { account, vaultId, lqPriceCalc } from "./utils.js";
import { chalkInfo, chalkSuccess } from "./chalk.js";
const log = console.log;

(async () => {
  log(chalkInfo("Subscribing to vault events..."));
  await account.subscribeToEvents({
    vaultId,
    createCallback: async (address, vaultState) => {
      log(chalkSuccess("New Account created!!"));

      // Calculate liquidating price
      const lqPrice = lqPriceCalc({
        vaultDebt: vaultState.vaultDebt,
        collateral: vaultState.collateral,
      });

      // Store data in DB
      const status = await CreateAccount({ address, lqPrice });
      log(chalkInfo(status));
    },
    transactionCallback: async (address, vaultState) => {
      log(chalkSuccess("New transaction detected!!"));

      // Calculate liquidating price
      const lqPrice = lqPriceCalc({
        vaultDebt: vaultState.vaultDebt,
        collateral: vaultState.collateral,
      });

      // Store data in DB
      const status = await CreateAccount({ address, lqPrice });
      log(chalkInfo(status));
    },
  });
})().catch((e) => console.log(e));
