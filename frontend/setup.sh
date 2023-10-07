#!/bin/bash

set -x

DOCKER_ENV_FILE_PATH=".env.docker"
DOCKER_ENV_FILE_CONTENT="BACKEND_URL=nestjs-backend"

ENV_FILE_PATH=".env.local"
ENV_FILE_CONTENT="BACKEND_URL=localhost"

create_env_file() {

touch $1
echo $2 >$1

}

[ -e $DOCKER_ENV_FILE_PATH ] || create_env_file $DOCKER_ENV_FILE_PATH $DOCKER_ENV_FILE_CONTENT
[ -e $ENV_FILE_PATH ] || create_env_file $ENV_FILE_PATH $ENV_FILE_CONTENT
