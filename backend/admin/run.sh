#!/bin/bash

docker exec --name distillogue_backend-1 "cd dist/backend/admin && $1"