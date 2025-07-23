include .env

run:
	@echo "Starting all services..."
	docker compose up --build -d
	@echo "Services started."

stop:
	@echo "Stopping services..."
	docker compose stop
	@echo "Services stopped."
