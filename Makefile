include ./Makefile.base.mk

# -- cosmetics --
help-colw = 7

# -- data --
ds-src = ~/Personal/forest/www/src
ds-root = $(ds-src)/Main.ts
ds-build = ./build
dr-root = ./src

# -- tools --
ts-deno = deno --unstable
ts-opts = --allow-read --allow-write --allow-run --allow-env --allow-net

ti-brew = brew
tb-deno = $(ts-deno)
tr-deno = $(ts-deno)
tt-deno = $(ts-deno)

## -- init (i) --
$(eval $(call alias, init, i/0))
$(eval $(call alias, i, i/0))

## init dev env
i/0: i/pre
.PHONY: i/0

# -- i/helpers
i/pre:
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
	mkdir -p $(ds-build)
	$(tr-deno) run $(ts-opts) $(ds-root) $(dr-root)
.PHONY: b/0

## clean the build
b/clean:
	rm -rf $(ds-build)
.PHONY:

## -- run (r) --
$(eval $(call alias, run, r/0))
$(eval $(call alias, r, r/0))

## alias for r/up
r/0: r/up
.PHONY: r/0

## run the site (server)
r/up:
	$(tr-deno) run $(ts-opts) $(ds-root) $(dr-root) --up --verbose
.PHONY: r/up

