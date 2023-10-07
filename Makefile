all: setup
	docker-compose up --build

backend:
	$(MAKE) -C backend

frontend:
	$(MAKE) -C frontend


.PHONY: backend frontend all
