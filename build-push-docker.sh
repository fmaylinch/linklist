# Exit on error or undefined variable
set -eu

#./build-vue.sh # if you changed Vue
./mvnw package # builds API
docker build -f src/main/docker/Dockerfile.jvm -t fmaylinch/linklist .
docker push fmaylinch/linklist

echo ""
echo "For Render: Deploy manually from https://dashboard.render.com (auto-deploy is disabled)"
echo "For Heroku: heroku container:push web / heroku container:release web"
