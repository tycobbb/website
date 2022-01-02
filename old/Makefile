include ./Makefile.base.mk

# -- cosmetics --
help-column-width = 12

# -- context --
tools-root-js  = node_modules/.bin
tools-gatsby   = $(tools-root-js)/gatsby
tools-jest     = $(tools-root-js)/jest
tools-tsc      = $(tools-root-js)/tsc
tools-tslint   = $(tools-root-js)/tslint -p ./tsconfig.json "./src/**/*.ts?(x)"
tools-prettier = $(tools-root-js)/prettier "./**/*.{js,ts,tsx}"
tools-apollo   = apollo

# -- init --
## initializes the dev environment
init: init/pre init/base
.PHONY: init

# -- init/helpers
# need to use global apollo for now, see:
#	- https://github.com/apollographql/apollo-tooling/issues/881
init/base:
	brew bundle -v
	yarn install
	yarn add global apollo
.PHONY: init/base

init/pre:
ifeq ("$(shell command -v brew)", "")
	$(info ✘ brew is not installed, please see:)
	$(info - https://brew.sh)
	$(error 1)
endif
.PHONY: init/pre

# -- start/stop --
## alias for s/dev
start: s/dev
.PHONY: start

## starts the dev server
s/dev:
	$(tools-gatsby) develop
.PHONY: s/dev

## starts the dev server after a clean
s/dev/clean: b/clean s/dev
.PHONY: s/dev/clean

## starts the prod server
s/prod: b/prod
	$(tools-gatsby) serve
.PHONY: s/prod

## starts the prod server after a clean
s/prod/clean: b/clean s/prod
.PHONY: s/prod/clean

# -- build --
## alias for b/prod
build: b/prod
.PHONY: build

## cleans the build cache
b/clean:
	$(tools-gatsby) clean
.PHONY: b/clean

# -- build/prod
## builds the prod site
b/prod:
	$(tools-gatsby) build
.PHONY: b/prod

# -- build/dev
## builds the dev utilities
b/dev: b/dev/pre b/graphql
.PHONY: b/dev

## generates types from graphql code
b/graphql:
	$(tools-apollo) client:codegen --tagName=graphql --target=typescript
.PHONY: b/graphql

# -- build/dev/helpers
b/dev/pre:
ifeq ("$(shell lsof -i :8000 | grep node)", "")
	$(info ✘ dev-server is not running, please run:)
	$(info - make s/dev)
	$(error 1)
endif
.PHONY: b/dev/pre

# -- verify --
## runs all verification steps
verify: v/typecheck v/lint v/format
.PHONY: verify

## typechecks the ts code
v/typecheck:
	$(tools-tsc)
.PHONY: v/typecheck

## runs all tests
v/test:
	$(tools-jest)
.PHONY: v/test

## runs the test in watch mode
v/test/watch:
	$(tools-jest) --watch
.PHONY: v/test/watch

## checks code formatting
v/format:
	$(tools-prettier) --check
.PHONY: v/format

## auto-fixes code formating errors
v/format/fix:
	$(tools-prettier) --write
.PHONY: v/format/fix

## runs the linter
v/lint:
	$(tools-tslint)
.PHONY: v/lint

## fixes any linter errors
v/lint/fix:
	$(tools-tslint) --fix
.PHONY: v/lint/fix
