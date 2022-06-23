user := $(shell id -u)
group := $(shell id -g)

dc := UID=$(user) GID=$(group) docker compose

.DEFAULT_GOAL := help
.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: up
up: ## Start the development environment
	$(dc) up -d

.PHONY: logs
logs: ## Show logs of the development environment
	$(dc) logs -f

.PHONY: stop
down: ## Stop the development environment
	$(dc) down
