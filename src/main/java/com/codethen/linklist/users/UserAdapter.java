package com.codethen.linklist.users;

import com.codethen.linklist.db.MongoUtil.CommonFields;
import com.mongodb.lang.Nullable;
import org.bson.Document;

import static com.codethen.linklist.db.MongoUtil.doc;

public class UserAdapter {

    private static class Fields {
        public static String username = "name";
        public static String password = "pwd";
    }

    public static Document byUsername(String username) {
        return doc(Fields.username, username);
    }

    @Nullable
    public static User from(@Nullable Document doc) {

        return doc == null ? null : User.builder()
                .id(doc.getObjectId(CommonFields._id).toString())
                .username(doc.getString(Fields.username))
                .password(doc.getString(Fields.password))
                .build();
    }

    @Nullable
    public static Document from(@Nullable User user) {

        return user == null ? null : doc()
                .append(Fields.username, user.getUsername())
                .append(Fields.password, user.getPassword());
    }
}
