# Report a Death

## Overview
Most of the tech used here is very standard across DI. We use Typescript Node lambdas, deployed using SAM. DynamoDB is
used for persistence. The main difference as compared with most services is that the frontend here is rendered using
lambdas.

We're using a lambda per page approach, with a small amount of custom build logic to package the correct templates into
each lambda. Assets are served from S3 using cloudfront.

![Architecure Diagram](docs/Architecture.png)

## Running locally
First time setup:
- Install latest Node (nvm suggested)
- Install AWS SAM CLI (`brew install aws-sam-cli`)
- Install jq (used by scripts/upload-assets.sh, `brew install jq`)
- Install Docker Desktop

Run:
```shell
make local
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