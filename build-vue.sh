# Exit on error or undefined variable
set -eu

PROJECT_FOLDER=$(pwd)

echo "--- Building Vue app ---"
cd src/main/vue-app
npm run build

echo "--- Copying Vue app to resources ---"
TARGET="$PROJECT_FOLDER/src/main/resources/META-INF/resources"
rm -f -R $TARGET/css
rm -f -R $TARGET/js
rm -f $TARGET/index.html
rm -f $TARGET/favicon.ico
mv dist/* $TARGET
rmdir dist
