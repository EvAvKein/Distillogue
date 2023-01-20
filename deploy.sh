docker-compose up --detach &&
docker-compose -f docker-compose.ssl.yaml up &&
docker-compose down &&
docker-compose -f docker-compose.yaml -f docker-compose.httpsOverride.yaml up