# Report a Death

## Overview
Most of the tech used here is very standard across DI. We use Typescript Node lambdas, deployed using SAM. DynamoDB is
used for persistence. The main difference as compared with most services is that the frontend here is rendered using
lambdas.

We're using a lambda per page approach, with a small amount of custom build logic to package the correct templates into
each lambda. Assets are served from S3 using cloudfront.

![Architecure Diagram](docs/Architecture.png)