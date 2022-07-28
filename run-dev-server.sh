set -eux
./mvnw compile quarkus:dev -Dsmallrye.jwt.sign.key-location=/Users/ferran/dev/projects/other/linklist/keys/privateKey.pem
