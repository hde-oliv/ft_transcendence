all: setup
	yarn install
	npx prisma generate
	bash -c "yarn start:dev"

setup:
	sh setup.sh

.PHONY: all setup
