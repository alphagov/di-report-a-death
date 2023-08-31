# Report a Death

Report a Death will be a citizen facing service aiming to improve the end-to-end experience of dealing with death and
the government.

## Overview

Most of the tech used here is very standard across DI. We use Typescript Node lambdas, deployed using SAM. DynamoDB is
used for persistence. The main difference as compared with most services is that the frontend here is rendered using
lambdas.

We're using a lambda per page approach, with a small amount of custom build logic to package the correct templates into
each lambda. Assets are served from S3 using cloudfront.

## Architecture

Architecture decision records start [here](docs/architecture/decisions/0001-use-adr.md)

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

### Named stack

Each developer gets their own named cloudformation stack in the dev account. This deploys
to `<name>.report-a-death.dev.account.gov.uk`.
To configure this, create a block in `samconfig.toml` that matches

```toml
[dev-<name>.deploy.parameters]
capabilities = "CAPABILITY_IAM"
confirm_changeset = true
resolve_s3 = true
stack_name = "<name>-rad"
s3_prefix = "<name>-rad"
region = "eu-west-2"
```

Then with valid AWS credentials:

```shell
DEV=<name> make deploy
```

### Shared stack

There is also a shared stack. This can be deployed with

```shell
make deploy-dev
```

## Adding a page

- Copy an existing page. Make sure to use `cp -a` to preserve the symlink to common
- Add the lambda function to the SAM template in template.yaml
- Change the package name in package.json