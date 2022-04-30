import { Account } from "#Models/index.js";

// Create a new account
const CreateAccount = async ({ address, lqPrice }) => {
  try {
    // Check if address exist
    const account = await getAddress(address);

    // Create new account
    if (!account) {
      const created = await createAcc({ address, lqPrice });
      return created;
    }

    // Update account
    if (account.liquidationPrice > lqPrice) {
      account.liquidationPrice = lqPrice;

      await account.save();
      return { code: 0, type: "OK", message: "Account successfully updated!!" };
    }

    return { code: 0, type: "OK", message: "No operation was carried out" };
  } catch (e) {
    return { code: 1, type: "ERR", message: e };
  }
};

// Create a new account
const createAcc = async ({ address, lqPrice }) => {
  try {
    const newAccount = new Account({ address, liquidationPrice: lqPrice });
    await newAccount.save();

    return {
      code: 0,
      type: "OK",
      message: "New account successfully created!!",
    };
  } catch (e) {
    return { code: 1, type: "ERR", message: "Failed to create new account" };
  }
};

// Fetch a single address
const getAddress = async (address) => {
  try {
    return await Account.findOne({ address });
  } catch (e) {
    return { code: 1, type: "ERR", message: "Failed to fetch document" };
  }
};

// Fetch Account with matching details (equalTo or lower than liquidationPrice)
const GetAccounts = async (currPrice) => {
  try {
    const accounts = await Account.find({
      liquidationPrice: { $lte: currPrice },
    });
    return accounts;
  } catch (e) {
    return { code: 1, type: "ERR", message: e };
  }
};

export { CreateAccount, GetAccounts };
