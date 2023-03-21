docker-compose down &&
docker-compose up --detach --build &&
docker-compose -f docker-compose.ssl.yaml up --build &&
docker-compose down &&
docker-compose -f docker-compose.yaml -f docker-compose.httpsOverride.yaml up --build