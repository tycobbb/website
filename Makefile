include .env
include ./Makefile.base.mk

# -- cosmetics --
help-colw = 7

# -- data --
ds-tag = 0.0.11
ds-www = ~/Personal/www/www.ts
ds-www-ci = https://deno.land/x/wvvw@$(ds-tag)/www.ts
ds-src = ./src
ds-dst = ./dst
dd-site-id = $(NETLIFY_SITE_ID)

# -- tools --
ts-deno = deno --unstable
ts-opts = --allow-read --allow-write --allow-run --allow-env --allow-net
ts-www = $(ts-deno) run $(ts-opts) $(ds-www) -x 420
ts-www-ci = $(ts-deno) run $(ts-opts) $(ds-www-ci)

ti-brew = brew
td-netlify = netlify

## -- init (i) --
$(eval $(call alias, init, i/0))
$(eval $(call alias, i, i/0))

## init dev env
i/0: i/pre
	$(ti-brew) bundle -v --no-upgrade
.PHONY: i/0

## updates deps
i/upgr:
	$(ti-brew) bundle -v
.PHONY: i/upadte

# -- i/helpers
.env:
	cp .env.sample .env

i/pre: .env
ifeq ("$(shell command -v $(ti-brew))", "")
	$(info ✘ brew is not installed, please see:)
	$(info - https://brew.sh)
	$(error 1)
endif
.PHONY: i/pre

## -- build (b) --
$(eval $(call alias, build, b/0))
$(eval $(call alias, b, b/0))

## build the site
b/0:
	$(ts-www) $(ds-src) --prod -o $(ds-dst)
.PHONY: b/0

## clean the build
b/clean:
	rm -rf $(ds-dst)
.PHONY: b/clean

## build the site for ci
b/ci:
	$(ts-www-ci) $(ds-src) --prod -o $(ds-dst)
.PHONY: b/ci

## -- run (r) --
$(eval $(call alias, run, r/0))
$(eval $(call alias, r, r/0))

## alias for r/up
r/0: r/up
.PHONY: r/0

## run the site
r/up:
	$(ts-www) $(ds-src) --up -o $(ds-dst)
.PHONY: r/up

## run the site in debug
r/debug:
	$(ts-www) $(ds-src) --up -o $(ds-dst) --verbose
.PHONY: r/debug

## -- deploy (d) --
$(eval $(call alias, deploy, d/0))
$(eval $(call alias, d, d/0))

## deploy the site
d/0:
	$(td-netlify) deploy --prod -d $(ds-dst) -s $(dd-site-id)
.PHONY: d/0
