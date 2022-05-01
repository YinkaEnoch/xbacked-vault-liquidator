/**
 * SEEDER
 * Fetch all open vaults and save their liquidation price in DB
 * */

import "dotenv/config";
import redis from "redis";
import { GetOpenVaults, GetUserInfo, lqPriceCalc } from "./utils.js";
import { CreateAccount } from "#Services/Account.service.js";

const seeder = async () => {
  try {
    const redisClient = redis.createClient(process.env.REDIS_PORT);

    redisClient.on("connect", () =>
      console.log("Redis connection successful ;)")
    );
    redisClient.on("error", (err) => console.log(err));

    await redisClient.connect();

    //Get open vaults
    const openVaults = await GetOpenVaults();
    console.log(`Got ${openVaults.length} vaults`);

    // Store open vaults in redis
    console.log("Storing returned vaults in redis...");
    await redisClient.lPush("openVaults", openVaults);

    // Pop vaults from redis
    for (let i = 0; i < openVaults.length; i++) {
      const address = await redisClient.lPop("openVaults");
      console.log(`Getting user info for address: ${address}`);
      const userInfo = await GetUserInfo(address);

      // early termination for empty vault
      if (!userInfo.vaultFound) continue;

      // Calculate liquidating price
      const lqPrice = lqPriceCalc({
        vaultDebt: userInfo.vaultDebt,
        collateral: userInfo.collateral,
      });

      // Store data in DB
      const status = await CreateAccount({ address, lqPrice });
      console.log(status);
    }

    // Delete redis key
    await redisClient.del("openVaults");

    // Close redis
    await redisClient.quit();

    console.log("Seeding is successful!!");
  } catch (e) {
    console.log(e);
  }
};

seeder().catch((e) => console.log(e));
