#!/bin/bash
#
DOCKER_ENV_FILE_PATH=".env.docker"
DOCKER_ENV_FILE_CONTENT="DATABASE_URL=postgresql://postgres:mysecretpassword@postgres:5432/postgres"

ENV_FILE_PATH=".env"
ENV_FILE_CONTENT="DATABASE_URL=\"postgresql://postgres:mysecretpassword@localhost:5432/postgres?schema=public\""


create_env_file() {

touch $1
echo $2 >$1

}


main() {

if [[ $(docker ps | grep database_backend) == "" ]]; then
	docker run -d --restart=always -p 5432:5432 -e "POSTGRES_PASSWORD=mysecretpassword" postgres:alpine --name database_backend
fi

[ -e $DOCKER_ENV_FILE_PATH ] || create_env_file $DOCKER_ENV_FILE_PATH $DOCKER_ENV_FILE_CONTENT
[ -e $ENV_FILE_PATH ] || create_env_file $ENV_FILE_PATH $ENV_FILE_CONTENT

}

main
