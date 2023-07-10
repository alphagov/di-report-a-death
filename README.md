# Report a Death

## Running locally
First time setup:
- Install latest Node (nvm suggested)
- Install AWS SAM CLI (`brew install aws-sam-cli`)

```shell
cd src
npm i
```

Run:
```shell
make
sam local start-api -s ../../assets -n local.env.json
```

Running tests:
```shell
cd src
npm run test --workspaces
```

Lint:
```shell
cd src
npm run lint
```

## Adding a page
- Copy an existing page
- Change the package name in package.json