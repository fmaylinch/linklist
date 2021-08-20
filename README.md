# LinkList

Stores a list of links.
Actually, it stores a list of items that may optionally contain a link.
Every item contains a title, and optionally: link, notes, image, tags.

Application in development. Ideas to implement:

- When you type the link, the application will try to retrieve the title and the image.
You can then modify the fields as you wish.
- You can search your notes by text or tag (write `#tag` to search only by tag).
- When you search by tag(s), you can share that list.
- You can share lists (in read-only mode, for now), using share rules.
    - For every share rule, you specify tags and optionally a username. That user (or all users by default) will be able to see the items with those tags.
    - You can add, remove, modify the share rules.
    - Maybe the rule can also allow edit/add/remove items.
- Shared links will be like `linklist.com/username/tag1+tag2+tag3`
    - The application will check that you are `username` or that this user has a share rule allowing you to access those items.


## Technologies used

- Backend
  - [Quarkus](https://quarkus.io)
  - [JWT](https://quarkus.io/guides/security-jwt)
  - [MongoDB](https://www.mongodb.com) – [Java driver](https://mongodb.github.io/mongo-java-driver/4.1/driver/getting-started/quick-start/)
  - [Argon2](https://github.com/phxql/argon2-jvm)

- Webapp  
  - [Vue.js](https://vuejs.org)
  - [Vuetify.js](https://vuetifyjs.com)
  - [Vue Router](https://router.vuejs.org/)


## Sample calls

```bash
# Register
SERVER=http://127.0.0.1:8070

curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"may", "password":"12345", "password2":"12345"}' \
  $SERVER/security/register | jq

# Login
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"may", "password":"12345"}' \
  $SERVER/security/login | jq

# Login and sets JWT variable (for the following calls)
JWT=$(curl -X POST --silent \
  -H "Content-Type: application/json" \
  -d '{"username":"may", "password":"llistzz"}' \
  $SERVER/security/login | jq -r .token)

# Create item
curl -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"title":"item1", "tags":["tag1", "tag2"]}' \
  $SERVER/items/upsertOne | jq

# Search items
curl -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"username":"may"}' \
  $SERVER/items/search | jq

# Delete item
curl -v -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"id":"ITEM_ID"}' \
  $SERVER/items/deleteOne | jq

# Update many (for now just updates tags)
curl -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
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

## Related guides


## Provided examples

### RESTEasy JSON serialisation using Jackson

This example demonstrate RESTEasy JSON serialisation by letting you list, add and remove quark types from a list. Quarked!

[Related guide section...](https://quarkus.io/guides/rest-json#creating-your-first-json-rest-service)
