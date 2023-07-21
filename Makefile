all: assets es-build templates

assets: install clean-assets fonts images js sass

install: src/package.json
	cd src; npm i

clean-assets:
	rm -rf assets

fonts:
	mkdir -p assets/public
	cp -r src/node_modules/govuk-frontend/govuk/assets/fonts assets/public/fonts

images:
	mkdir -p assets/public
	cp -r src/node_modules/govuk-frontend/govuk/assets/images assets/public/images

js:
	mkdir -p assets/public
	cp src/node_modules/govuk-frontend/govuk/all.js assets/public/all.js

sass:
	cd src; npm run build-sass

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