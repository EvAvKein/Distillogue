docker-compose down &&
docker-compose -f docker-compose.cert.yaml up --build --force-recreate &&
docker-compose down &&
docker-compose -f docker-compose.prod.yaml up --build --force-recreate