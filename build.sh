#!/bin/sh
docker run -v "$(pwd)"/build:/usr/src/out soldat-launcher/build npm run make
docker run -v "$(pwd)"/build:/usr/src/out soldat-launcher/build chown -R $(id -u):$(id -g) -R /usr/src/out
