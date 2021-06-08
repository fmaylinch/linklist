package com.codethen.linklist.users;

import com.codethen.linklist.db.MongoService;
import com.codethen.linklist.db.MongoUtil;
import com.mongodb.client.MongoCollection;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import org.bson.Document;

import javax.annotation.Nonnull;
import javax.inject.Singleton;

import static com.codethen.linklist.users.UserAdapter.byUsername;

@Singleton
public class UserService {

    private final MongoCollection<Document> users;

    public UserService(MongoService mongoService) {
        users = mongoService.getCollection("users");
    }

    public User findByUsername(String username) {
        final Document doc = users.find(byUsername(username)).first();
        return UserAdapter.from(doc);
    }

    @SuppressFBWarnings(
            value = {"NP_NULL_ON_SOME_PATH_FROM_RETURN_VALUE"},
            justification = "user should not be null, so neither doc")
    public User createUser(@Nonnull User user) {
        final Document doc = UserAdapter.from(user);
        users.insertOne(doc);
        user.setId(doc.getObjectId(MongoUtil.CommonFields._id).toString());
        return user;
    }
}
