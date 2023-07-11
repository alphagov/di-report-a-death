#!/bin/sh

COMMIT_HASH=$(git rev-parse HEAD)
ASSET_BUCKET_NAME=$(sam list stack-outputs --stack-name rad --output json | jq '.[] | select(.OutputKey | contains("AssetBucketName"))["OutputValue"]' -r)

aws s3 cp --recursive assets/public "s3://$ASSET_BUCKET_NAME/$COMMIT_HASH"