# Exit on error or undefined variable
set -eu

./build-vue.sh # if you changed Vue
./mvnw package # builds API
docker build -f src/main/docker/Dockerfile.jvm -t fmaylinch/linklist .
docker push fmaylinch/linklist

echo ""
echo "Now push changes to Git or deploy manually in https://dashboard.render.com"
