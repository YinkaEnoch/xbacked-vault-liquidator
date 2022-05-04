# xbacked-vault-liquidator

A flexible vault liquidator for the xBacked protocol. The liquidator watches the
current price of ALGO and then uses that to determine which vaults to liquidate.

## Modules

The project contains four (4) modules

- Seeder: The module fetches all open vaults in the xBacked protocol and stores
  them in a redis list. The info for the addresses in the list is then fetched
  and the liquidation price for the address is calculated before being saved in
  a MongoDB database. This is a one-time operation.

- Subscriber: The module watches for two (2) events on the xBacked protocol:
  new account creation and new transactions. When a new account is created, the
  account liquidation price is calculated and store in the database. Also, a new
  liquidation price is also calculated for an account when a new transaction is
  detected. The new price is stored in the database only if it is lesser than
  the current saved price. The operation runs forever.

- Price Checker: The module checks for the current price of ALGO and then
  proceeds to fetch all accounts that are equal or greater then the fetched
  price. The fetched accounts can then be liquidated if it's maximum debt
  payable is equal or greater then the MINIMUM_LIQUIDATING_AMOUNT. The operation
  runs after a specified time interval.

- Liquidator: The module liquidates an account

## Install

Clone the `xbacked-vault-liquidator` repository and run the `npm install`
command to install the project dependencies

## Usage

Each of the modules can be run differently using the:

- npm run start:seeder
- npm run start:subscriber
- npm run start:checker

Or run the entire modules by running the `npm start` command. The npm package
`concurrently` is used to run the modules all at once

## Environment Variables

#### General

- PASS_PHRASE: [Required] The mnemonic pass phrase for the account to use
- xUSD_ID: [Optional] The Algorand Identification number for xUSD. Currently `(62281549)` on
  the testnet
- NETWORK: [Required] TestNet | MainNet

#### Seeder

- START_ROUND: [Optional] The start round for getting the open vaults
- END_ROUND: [Optional] The end round for getting the open vaults

#### Price Checker

- SLEEP_DURATION: [Required] Time interval between each operation
- LQ_COLLATERAL_RATIO: [Optional] Defaults to 110. Future value to be determined
  by the protocol
- MINIMUM_LIQUIDATING_AMOUNT: [Required] Minimum amount an account must have to
  be considered for liquidation. Set to zero (0) to liquidate any account

#### Databases

- REDIS_URL: [Optional] Specify a URL for redis client to connect to.
  Defaults to local redis
- MONGO_DB_URI: <b>[Required]</b> Specify the URL for mongodb database

## Requirements

Install and configure the databases below on the intended machine

- Redis
- MongoDB

