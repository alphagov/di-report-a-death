# Stack Orchestration Tool
Adapted from [here](https://github.com/alphagov/di-data-life-events-platform/blob/8239a938929e6167fd7ec69de6ad3718c478c8ba/stack-orchestration/README.md).
Further documentation can be found [here](https://govukverify.atlassian.net/wiki/spaces/PLAT/pages/3441361094/How+to+create+cloudformation+stacks+using+the+stack-orchestation-tool).

## Setup

Clone the repo https://github.com/alphagov/di-devplatform-deploy in a directory next to this repo.

### Required tools

* aws cli for management of Cloudformation stacks
* jq for formatting and conversion

## How to use

Choose your account to run against. Login to this account with AWS SSO, setting your AWS_PROFILE environment variable,
then run the below, replacing `<environment>`with one of `dev`, `build`, `staging`, `integration`, `production`:

```shell
AWS_PAGER="" SKIP_AWS_AUTHENTICATION=true ./provision_all.sh <environment>
```

## Notes
The provisioner tool expects a profile name and tries to manage auth. We ignore this and just use and environment name as
it is easier to manage auth manually.
