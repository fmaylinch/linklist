# LinkList

Stores a list of links.
Actually, it stores a list of items that may optionally contain a link.
Every item contains a title, and optionally: link, notes, image, tags.

The frontend is being developed now in React Native (previously it was in Vue).

## Technologies used

- Backend
  - [Quarkus](https://quarkus.io)
  - [JWT](https://quarkus.io/guides/security-jwt)
  - [MongoDB](https://www.mongodb.com) – [Java driver](https://mongodb.github.io/mongo-java-driver/4.1/driver/getting-started/quick-start/)
  - [Argon2](https://github.com/phxql/argon2-jvm)

- App
  - [React Native](https://reactnative.dev)
  - [React Navigation](https://reactnavigation.org)
  - [Expo](https://expo.dev)

- Webapp (might be outdated)
  - [Vue.js](https://vuejs.org)
  - [Vuetify.js](https://vuetifyjs.com)
  - [Vue Router](https://router.vuejs.org/)

## Current deploy

Now the Vue/API is hosted at https://linklist.onrender.com.
That link should open the webapp. But it also has an API ([test endpoint](https://linklist.onrender.com/test/message)).

Instructions for Vue/API:
- Run Vue in dev mode from [src/main/vue-app](src/main/vue-app) with `npm run serve`
- Run API from IDE or with `./mvnw compile quarkus:dev`
- Deploy Vue or API changes like this:
  - `./build-vue.sh` - if you changed Vue 
  - `./mvnw package`
  - `docker build -f src/main/docker/Dockerfile.jvm -t fmaylinch/linklist .`
  - `docker push fmaylinch/linklist`
- Then push git changes
  - [render](https://render.com) will re-deploy automatically, because it pulls [Dockerfile](Dockerfile)
  - If you pushed changes before, manually re-deploy app from [render](https://render.com)

Instructions for ReactNative app:
- Go to [src/main/react-app](src/main/react-app)
- Run it in dev mode with `yarn start`
- Publish it with `expo publish`

## Sample calls

```bash
SERVER=http://127.0.0.1:8070

# Register
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"may", "password":"12345", "password2":"12345"}' \
  $SERVER/security/register | jq

# Login
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"may", "password":"12345"}' \
  $SERVER/security/login | jq

# Login and sets JWT variable
JWT=$(curl -X POST --silent \
  -H "Content-Type: application/json" \
  -d '{"username":"may", "password":"llistzz"}' \
  $SERVER/security/login | jq -r .token)

# Prepare params for the following calls
AUTH="Authorization: Bearer $JWT"
CONTENT_TYPE="Content-Type: application/json"
HEADERS="-H '$AUTH' -H '$CONTENT_TYPE'"
# Note that we always use POST (that's a personal choice)
COMMON_PARAMS = "-X POST $HEADERS"

# Upsert item
# TODO: Check that missing fields are initialized in server
curl $COMMON_PARAMS \
  -d '{"title":"item1", "tags":["tag1", "tag2"]}' \
  $SERVER/items/upsertOne | jq

# Search items
curl $COMMON_PARAMS \
  -d '{"username":"may"}' \
  $SERVER/items/search | jq

# Delete item
curl $COMMON_PARAMS \
  -d '{"id":"ITEM_ID"}' \
  $SERVER/items/deleteOne | jq

# Update many (for now just updates tags)
curl $COMMON_PARAMS \
  -d '{"tagsToSearch":["test"], "tagsToAdd":["added"], "tagsToRemove":[]}' \
  $SERVER/items/updateMany
```


## How JWT keys were created

See: https://quarkus.io/guides/security-jwt#generating-a-jwt

```bash
openssl genrsa -out rsaPrivateKey.pem 2048
openssl rsa -pubout -in rsaPrivateKey.pem -out publicKey.pem
openssl pkcs8 -topk8 -nocrypt -inform pem -in rsaPrivateKey.pem -outform pem -out privateKey.pem
```

- `publicKey.pem` is referenced in `application.properties`, `mp.jwt.verify.publickey.location`.
- `privateKey.pem` is passed as an env var `smallrye.jwt.sign.key-location` (although this is deprecated).  

---

## Original README:

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: https://quarkus.io/ .

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:
```shell script
./mvnw compile quarkus:dev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at http://localhost:8080/q/dev/.

## Packaging and running the application

The application can be packaged using:
```shell script
./mvnw package
```
It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

If you want to build an _über-jar_, execute the following command:
```shell script
./mvnw package -Dquarkus.package.type=uber-jar
```

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

## Creating a native executable

You can create a native executable using: 
```shell script
./mvnw package -Pnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using: 
```shell script
./mvnw package -Pnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/linklist-1.0.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult https://quarkus.io/guides/maven-tooling.html.

## Provided examples

### RESTEasy JSON serialisation using Jackson

This example demonstrate RESTEasy JSON serialisation by letting you list, add and remove quark types from a list. Quarked!

[Related guide section...](https://quarkus.io/guides/rest-json#creating-your-first-json-rest-service)
