# Overview

This template creates an S3 bucket with Cloudfront distribution for serving static assets. The bucket has an Object Lock
rule in Governance mode to retain objects for two years. This is to prevent

## Deployment

Replace `<environment>` with `dev` or `production` in either of the commands below.

### Creating a New Stack

Set your AWS profile to the correct environment, then run `export ENVIRONMENT=<environment>`, then run:

```bash
aws cloudformation create-stack --stack-name asset-distribution \
  --template-body file://$(pwd)/template.yaml \
  --region eu-west-2 \
  --capabilities CAPABILITY_NAMED_IAM \
  --tags Key=Product,Value="GOV.UK Sign In" \
         Key=System,Value="Report a Death" \
         Key=Environment,Value="$ENVIRONMENT" \
         Key=Owner,Value="report-a-death-dev@digital.cabinet-office.gov.uk"
```

### Updating the Stack

Set your AWS profile to the correct environment, run `export ENVIRONMENT=<environment>` then run:

```bash
aws cloudformation update-stack --stack-name asset-distribution \
  --template-body file://$(pwd)/template.yaml \
  --region eu-west-2 \
  --capabilities CAPABILITY_NAMED_IAM \
  --tags Key=Product,Value="GOV.UK Sign In" \
         Key=System,Value="Report a Death" \
         Key=Environment,Value="$ENVIRONMENT" \
         Key=Owner,Value="report-a-death-dev@digital.cabinet-office.gov.uk"
```

### Stack Outputs

| Type   | Name                          | Description                                                            |
|--------|-------------------------------|------------------------------------------------------------------------|
| Output | `AssetBucketName`             | Name of the created S3 bucket                                          |
| Output | `AssetDomain`                 | Domain name of the asset distribution                                  |
| Output | `GithubActionsUploadRoleName` | Name of the role created for Github actions to assume to upload assets |
| Output | `GithubActionsUploadRoleArn`  | ARN of the role created for Github actions to assume to upload assets  |

## Github actions

As part of the deploy job, static assets are uploaded to the bucket. To set this up, the following repository secrets
need to be set:

| Secret Name                 | Stack Output Name            |
|-----------------------------|------------------------------|
| `ASSET_BUCKET_NAME`         | `AssetBucketName`            |
| `GH_ACTIONS_ASSET_ROLE_ARN` | `GithubActionsUploadRoleArn` |