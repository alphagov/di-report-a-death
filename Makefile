all: assets es-build templates

assets: install-build-deps clean-assets fonts images js sass

install-build-deps: src/build-deps/package.json
	cd src/build-deps; npm i

clean-assets:
	rm -rf assets

fonts:
	mkdir -p assets/public
	cp -r src/build-deps/node_modules/govuk-frontend/govuk/assets/fonts assets/public/fonts

images:
	mkdir -p assets/public
	cp -r src/build-deps/node_modules/govuk-frontend/govuk/assets/images assets/public/images

js:
	mkdir -p assets/public
	cp src/build-deps/node_modules/govuk-frontend/govuk/all.js assets/public/all.js

sass:
	cd src/build-deps; npm run build-sass

es-build:
	sam build

templates: FORCE
	node scripts/package-templates.js

local: all
	docker compose --project-directory infrastructure/dev -f infrastructure/dev/dynamodb.docker-compose.yaml up &
	sam local start-api -s ../../assets -n local.env.json --docker-network lambda-local

clean-local:
	docker compose -f infrastructure/dev/dynamodb.docker-compose.yaml down

upload-assets: FORCE
	scripts/upload-assets.sh

deploy: all upload-assets
	sam deploy --parameter-overrides CommitHash=$$(git rev-parse HEAD)

FORCE: ;