import "dotenv/config";
import {
  Account,
  VAULT_IDS,
  Vault,
  getOpenVaults,
} from "@xbacked-dao/xbacked-sdk";

const account = new Account({
  mnemonic: process.env.PASS_PHRASE,
  network: process.env.NETWORK,
});

const vault = new Vault({ id: VAULT_IDS.TestNet.algo });

// Additional option
const vaultOpts = {};

if (
  process.env.START_ROUND &&
  typeof process.env.START_ROUND.toLowerCase() === "number"
) {
  vaultOpts.startRound = process.env.START_ROUND;
}

if (
  process.env.END_ROUND &&
  typeof process.env.END_ROUND.toLowerCase() === "number"
) {
  vaultOpts.endRound = process.env.END_ROUND;
}
// Get all open vaults
export const GetOpenVaults = async () =>
  Array.from(new Set(await getOpenVaults({ account, vault, ...vaultOpts })));

// Get user info for an address
export const GetUserInfo = async (address) =>
  await account.getUserInfo({ vault, address });
