import "dotenv/config";
import mongoose from "mongoose";
import Account from "./Account.model.js";

mongoose
  .connect(process.env.MONGO_DB_URI, {})
  .then(() => console.log("MongoDB database connection successful :)"))
  .catch((e) => console.log(e));

export { Account };
