# Report a Death

## Running locally
First time setup:
- Install latest Node (nvm suggested)
- Install AWS SAM CLI (`brew install aws-sam-cli`)
- Install jq (used by scripts/upload-assets.sh, `brew install jq`)

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

## Deploy to dev
With valid AWS credentials:
```shell
make deploy
```

## Adding a page
- Copy an existing page. Make sure to use `cp -a` to preserve the symlink to common
- Change the package name in package.json