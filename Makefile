DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_UP = $(DOCKER_COMPOSE) up
DOCKER_COMPOSE_DOWN = $(DOCKER_COMPOSE) down
UNIT_TEST_COMMAND = npm test -- --testPathPattern=unit

up:
	$(DOCKER_COMPOSE_UP)

down:
	$(DOCKER_COMPOSE_DOWN)

unit:
	$(UNIT_TEST_COMMAND)