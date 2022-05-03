import "dotenv/config";
import mongoose from "mongoose";
import Account from "./Account.model.js";
import { chalkSuccess, chalkDanger } from "../chalk.js";

mongoose
  .connect(process.env.MONGO_DB_URI, {})
  .then(() =>
    console.log(chalkSuccess("MongoDB database connection successful :)"))
  )
  .catch((e) => console.log(chalkDanger(e)));

export { Account };
