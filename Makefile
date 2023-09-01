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
	cd src; npm run bundle

sass:
	cd src; npm run build-sass

lint: install
	cd src; npm run lint

check-lint: install
	cd src; npm run check-lint

test: install
	cd src; npm run test --workspaces

es-build:
	sam build

templates: FORCE
	node scripts/package-templates.js

local: all
	docker compose --project-directory infrastructure/dev -f infrastructure/dev/dynamodb.docker-compose.yaml up &
	sam local start-api -s ../../assets -n local.env.json --docker-network lambda-local --warm-containers LAZY

clean-local:
	docker compose -f infrastructure/dev/dynamodb.docker-compose.yaml down

upload-assets-dev: FORCE
	scripts/upload-assets-dev.sh

deploy-dev: all upload-assets-dev
	sam deploy --parameter-overrides CommitHash=$$(git rev-parse HEAD) Environment=dev

upload-assets: FORCE
	scripts/upload-assets-dev.sh $$DEV

deploy: all upload-assets
	sam deploy --config-env dev-$$DEV --parameter-overrides CommitHash=$$DEV\_$$(git rev-parse HEAD) Environment=dev Developer=$$DEV

FORCE: ;