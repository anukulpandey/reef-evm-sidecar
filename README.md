# Reef EVM Sidecar

Listens to Blocks using Reef EVM RPC Provider, parses block data and extracts the affected EVM account addresses and contract addresses of the block. Emits them using [Pusher](pusher.com) which is subscribed to update account balances.

## Run Locally

1. Clone the repository

```
git clone https://github.com/anukulpandey/reef-evm-sidecar
```

2. Install dependencies

```
cd reef-evm-sidecar
yarn install
```

3. Add env variables

```
cp .env.sample .env
```

4. Run 

```
yarn start
```