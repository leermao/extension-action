TOP_DIR=.
README=$(TOP_DIR)/README.md

VERSION=$(strip $(shell cat version))

build: clean bump-build

build-test: clean bump-build-test

fonts:
	@echo "Copying font files..."
	@rm -rf public/static/css && mkdir -p public/static/css/fonts
	@cp -r ./node_modules/@arcblock/did-logo/fonts public/static/css
	@cp -r ./node_modules/@arcblock/did-logo/style.css public/static/css

init:
	@echo "Install npm dependencies required for this repo..."
	@yarn

setenv:
	@echo "Setup .env file..."
	@echo "SKIP_PREFLIGHT_CHECK=true" > .env

github-action-init:
	@echo "Install npm dependencies required for this repo..."
	@echo "Setup .env file..."
	@echo "SKIP_PREFLIGHT_CHECK=true" > .env.local
	@yarn

clean:
	@echo "All cache and build are cleaned."
	@yarn clean

lint:
	@echo "Lint the repo ..."
	@yarn lint

deploy:
	@echo "Deploy software..."

run:
	@echo "Run software..."
	@yarn start

coverage:
	@echo "Running test suites and collecting coverage..."
	@npm run coverage

.PHONY: build init test doc clean run bump-version bump-build
