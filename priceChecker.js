/**
 * PRICE_CHECKER
 * Check the current price of ALGO and use that to liquidate vault(s)
 * */

import "dotenv/config";
import {
  convertFromMicroUnits,
  calcMaxDebtPayout,
} from "@xbacked-dao/xbacked-sdk";
import { account, vault } from "./utils.js";
import { GetAccounts } from "#Services/Account.service.js";
import chalk from "chalk";
import { chalkInfo, chalkWarning, chalkDanger, chalkSuccess } from "./chalk.js";
import Liquidator from "./liquidator.js";
const log = console.log;

const PriceChecker = async () => {
  // Check the current price of algo
  // TODO: Create a separate module that can use a user-specified price oracle
  const { collateralPrice } = await account.getVaultState({ vault });
  const price = convertFromMicroUnits(collateralPrice);
  log(chalkInfo(`Current asset price is ${chalk.underline(price)}`));

  // Fetch account(s) that are greater or equal to price
  const accounts = await GetAccounts(price);
  log(
    chalkInfo(
      `${accounts.length} accounts have a price that is ${chalk.inverse(
        "greater or equal"
      )} to ${price}`
    )
  );

  // Early termination for no accounts
  if (accounts.length < 1) {
    log(chalkInfo("There are no accounts to liquidate!!"));
    return false;
  }

  // Check for the current state of that address
  // Account details might have changed in the last minutes
  log(chalkInfo("Checking the current state of the addresses..."));
  const userPromises = accounts.map(async ({ address }) => {
    return {
      address,
      addressInfo: await account.getUserInfo({ vault, address }),
    };
  });
  const userInfos = await Promise.allSettled(userPromises);

  // Filter accounts with collateralRatio <= 110%
  log(chalkInfo("Filtering accounts that can be liquidated!!"));
  const lqAccounts = userInfos.filter(({ status, value }) => {
    if (status === "fulfilled") {
      return (
        value.addressInfo.liquidating &&
        value.addressInfo.collateralRatio <= process.env.LQ_COLLATERAL_RATIO
      );
    }
  });

  // Early termination for no accounts
  if (lqAccounts.length < 1) {
    log(chalkWarning("No accounts is available for liquidation :("));
  }

  // Calculate maxDebtPayout for each account
  // Only liquidate account if maxDebt is equal or greater than
  // minimum liquidating amount
  lqAccounts.forEach(async (userAccount) => {
    const {
      value: {
        addressInfo: { collateral, vaultDebt },
      },
    } = userAccount;
    // Calculate maxDebtPayout
    const { collateralPrice } = await account.getVaultState({ vault });
    const maxDebt = calcMaxDebtPayout(collateral, collateralPrice, vaultDebt);

    // Early terminate if maxDebt is lower than minimum liquidating amount
    if (maxDebt < process.env.MINIMUN_LIQUIDATING_AMOUNT) {
      log(
        chalkInfo(
          `maxDebt ${chalk.underline(
            maxDebt
          )} is lesser than the minimum liquidating amount ${chalk.underline(
            process.env.MINIMUN_LIQUIDATING_AMOUNT
          )}`
        )
      );
      return false;
    }

    // Liquidate account
    const lqStatus = await Liquidator({
      address: userAccount.value.address,
      debtAmount: process.env.MINIMUM_LIQUIDATING_AMOUNT,
    });

    if (lqStatus.code == 0) {
      log(chalkSuccess("Liquidation successful!!"));
    } else {
      log(chalkDanger(`Liquidation failed!! Reason: ${lqStatus.message}`));
    }
  });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runner = async () => {
  do {
    try {
      log(chalkInfo("Sleeping..."));
      await sleep(process.env.SLEEP_DURATION);
      await PriceChecker();
    } catch (e) {
      log(chalkDanger(e));
    }
  } while (true);
};
runner().catch((e) => console.log(e));
