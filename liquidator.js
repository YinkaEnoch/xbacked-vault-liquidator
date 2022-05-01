import { account, vault } from "./utils.js";

const Liquidator = async ({ address, debtAmount }) => {
  try {
    const lqStatus = await account.liquidateVault({
      vault,
      address,
      debtAmount,
    });

    return { code: 0, type: "OK", message: lqStatus };
  } catch (e) {
    return { code: 1, type: "ERR", message: e };
  }
};

export default Liquidator;
