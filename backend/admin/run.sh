#!/bin/bash

docker exec -i -w /backend/dist/backend/admin "$(docker ps -qf 'name=distillogue_backend_1')" "$@"