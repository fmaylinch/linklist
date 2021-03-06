# Exit on error
set -e

PROJECT_FOLDER=$(pwd)

echo "--- Building Vue app ---"
cd src/main/vue-app
npm run build

# Now the S3 website is not used. I removed it.
# We use a L7 balancer that points to the VM. The L7 has a DNS certificate for HTTPS.
# If I want to use the S3 website, https://linklist.es should go to the S3 website, but apiUrl should go to the L7.
#AWS_OPTIONS="--endpoint-url=https://storage.yandexcloud.net"
#BUCKET="s3://www.linklist.es"
#echo "--- Removing old resources from cloud bucket ---"
#aws $AWS_OPTIONS s3 rm  --recursive $BUCKET/js
#aws $AWS_OPTIONS s3 rm  --recursive $BUCKET/css
#echo "--- Uploading new resources to cloud bucket ---"
#aws $AWS_OPTIONS s3 cp --recursive dist $BUCKET

echo "--- Copying Vue app to resources ---"
TARGET="$PROJECT_FOLDER/src/main/resources/META-INF/resources"
rm -f -R $TARGET/css
rm -f -R $TARGET/js
rm -f $TARGET/index.html
rm -f $TARGET/favicon.ico
mv dist/* $TARGET
rmdir dist

cd "$PROJECT_FOLDER"

echo "--- Building jar ---"
mvn package

echo "--- Building Docker image ---"
docker build -f src/main/docker/Dockerfile.jvm -t cr.yandex/crp81dg788qn7ff84jpi/linklist .

echo "--- Selecting profile fm ---"
yc container registry configure-docker --profile fm

echo "--- Pushing Docker image ---"
docker push cr.yandex/crp81dg788qn7ff84jpi/linklist

echo "--- Restart Docker in VM ---"
echo "ssh fmaylinch@130.193.46.10"
echo "./linklist/restart-docker.sh"
echo "Access website at https://linklist.es"
