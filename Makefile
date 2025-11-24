# Makefile rules use one Bash session in strict mode.
SHELL := bash
.SHELLFLAGS := -ceuo pipefail
MAKEFLAGS += --no-print-directory
.ONESHELL:
.SILENT:


# Configuration
NODE_VERSION := 24
NVM_VERSION := v0.40.3


# $(call check_prog,cmd) checks if cmd exists.
check_prog = $(shell command -v $(1) >/dev/null 2>&1 && echo "yes" || echo "no")


# `make check-env'
.PHONY: check-env
check-env:
	if [ "$(call check_prog,node)" = "no" ]; then
		echo "ERROR | node is not installed.";
		exit 1;
	fi
	if [ "$(call check_prog,npm)" = "no" ]; then
		echo "ERROR | npm is not installed.";
		exit 1;
	fi
	echo "INFO | Required dependencies are installed."


# `make install-prod'
.PHONY: install-prod
install-prod:
	${MAKE} check-env
	npm install --omit=dev
	echo "INFO | All production dependencies have been installed."


# `make install'
.PHONY: install
install:
	${MAKE} check-env
	npm install
	echo "INFO | All dependencies have been installed."


# `make format`
.PHONY: format
format:
	npx prettier --write .
	echo "INFO | Source files have been formatted."


# `make lint`
.PHONY: lint
lint:
	npx eslint . --fix
	echo "INFO | Source files have been linted."


# `make quality`
.PHONY: quality
quality:
	${MAKE} format
	${MAKE} lint
	echo "INFO | All static analysis tools have been executed."


# `make dev`
.PHONY: dev
dev:
	echo "INFO | On source files change, reload files."
	export PORT=3000
	npx tsx watch src/main.ts


# `make compile`
.PHONY: compile
compile:
	for pkg in src/package/*; do
	  npx tsc -p "$$pkg" &
	done
	wait
	npx tsc -p .
	echo "INFO | Source files have been compiled."


# `make test'
.PHONY: test
test:
	export PORT=3000
	NODE_OPTIONS='--experimental-vm-modules' npx vitest
	echo "INFO | All tests have been executed."


# `make start'
.PHONY: start
start:
	export PORT=3000
	echo "INFO | A server should be listening on port $$PORT."
	node dist/main.js


# `make clean' deletes all generated files.
.PHONY: clean
clean:
	rm -rf node_modules dist
	echo "INFO | All generated files have been deleted."
