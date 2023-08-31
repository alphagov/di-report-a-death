#!/bin/sh

COMMIT_HASH=$(git rev-parse HEAD)
STACK_OUTPUT=$(sam list stack-outputs --stack-name asset-distribution --output json) || exit 1
ASSET_BUCKET_NAME=$(echo "$STACK_OUTPUT" | jq '.[] | select(.OutputKey | contains("AssetBucketName"))["OutputValue"]' -r)

aws s3 cp --recursive assets/public "s3://$ASSET_BUCKET_NAME/$1${1:+_}$COMMIT_HASH"