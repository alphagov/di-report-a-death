ENVIRONMENT=${1}

PROVISION_COMMAND="../../../di-devplatform-deploy/stack-orchestration-tool/provisioner.sh"

export AUTO_APPLY_CHANGESET=true
export SKIP_AWS_AUTHENTICATION=true
export AWS_PAGER=""

## Provision dependencies
for dir in configuration/"$ENVIRONMENT"/*/; do
  STACK=$(basename "$dir")
  if [[ $STACK != "sam-deploy-pipeline" ]]; then
    $PROVISION_COMMAND "$ENVIRONMENT" "$STACK" "$STACK" LATEST &
  fi
done

## Provision secure pipelines
$PROVISION_COMMAND "$ENVIRONMENT" sam-deploy-pipeline sam-deploy-pipeline LATEST
