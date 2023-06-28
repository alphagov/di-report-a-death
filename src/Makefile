all: assets es-build templates

assets: install-build-deps clean-assets fonts images js sass

install-build-deps: build-deps/package.json
	cd build-deps; npm i

clean-assets:
	rm -rf assets

fonts:
	mkdir -p assets/public
	cp -r build-deps/node_modules/govuk-frontend/govuk/assets/fonts assets/public/fonts

images:
	mkdir -p assets/public
	cp -r build-deps/node_modules/govuk-frontend/govuk/assets/images assets/public/images

js:
	mkdir -p assets/public
	cp build-deps/node_modules/govuk-frontend/govuk/all.js assets/public/all.js

sass:
	cd build-deps; npm run build-sass

es-build:
	sam build

templates: FORCE
	node package-templates.js

FORCE: ;