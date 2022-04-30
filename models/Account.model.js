import mongoose from "mongoose";

const AccSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
  },
  liquidationPrice: {
    type: Number,
    required: true,
  },
});

const Account = mongoose.model("Account", AccSchema);
export default Account;
