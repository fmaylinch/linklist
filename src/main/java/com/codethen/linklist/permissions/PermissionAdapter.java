package com.codethen.linklist.permissions;

import com.codethen.linklist.db.MongoUtil.CommonFields;
import com.mongodb.lang.Nullable;
import org.bson.Document;
import org.bson.types.ObjectId;

import static com.codethen.linklist.db.MongoUtil.doc;
import static java.util.stream.Collectors.toList;

public class PermissionAdapter {

    private static class Fields {
        public static String userId = "userId";
        public static String usernames = "usernames";
        public static String userIds = "userIds";
        public static String tags = "tags";
    }

    public static Document byIdAndUserId(String id, String userId) {
        return byUserId(userId).append(CommonFields._id, new ObjectId(id));
    }

    public static Document byUserId(String userId) {
        return doc(Fields.userId, new ObjectId(userId));
    }

    @Nullable
    public static Permission from(@Nullable Document doc) {

        return doc == null ? null : Permission.builder()
                .id(doc.getObjectId(CommonFields._id).toString())
                .userId(doc.getObjectId(Fields.userId).toString())
                .usernames(doc.getList(Fields.usernames, String.class))
                .userIds(doc.getList(Fields.userIds, ObjectId.class).stream().map(ObjectId::toString).collect(toList()))
                .tags(doc.getList(Fields.tags, String.class))
                .build();
    }

    @Nullable
    public static Document from(@Nullable Permission permission) {

        return permission == null ? null : doc()
                .append(Fields.userId, new ObjectId(permission.getUserId()))
                .append(Fields.usernames, permission.getUsernames())
                .append(Fields.userIds, permission.getUserIds().stream().map(ObjectId::new).collect(toList()))
                .append(Fields.tags, permission.getTags());
    }
}
