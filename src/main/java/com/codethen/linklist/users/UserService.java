package com.codethen.linklist.users;

import com.codethen.linklist.db.MongoService;
import com.codethen.linklist.db.MongoUtil;
import com.mongodb.client.MongoCollection;
import org.bson.Document;

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

    public User createUser(User user) {
        final Document doc = UserAdapter.from(user);
        users.insertOne(doc);
        user.setId(doc.getObjectId(MongoUtil.CommonFields._id).toString());
        return user;
    }
}
