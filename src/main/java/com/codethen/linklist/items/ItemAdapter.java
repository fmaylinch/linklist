package com.codethen.linklist.items;

import com.codethen.linklist.db.MongoUtil.CommonFields;
import com.codethen.linklist.db.MongoUtil.Ops;
import com.mongodb.lang.Nullable;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.List;

import static com.codethen.linklist.db.MongoUtil.doc;

public class ItemAdapter {

    private static class Fields {
        public static String userId = "userId";
        public static String title = "title";
        public static String url = "url";
        public static String notes = "notes";
        public static String image = "image";
        public static String score = "score";
        public static String tags = "tags";
    }

    public static Document byIdAndUserId(String id, String userId) {
        return byUserId(userId).append(CommonFields._id, new ObjectId(id));
    }

    public static Document byUserId(String userId) {
        return doc(Fields.userId, new ObjectId(userId));
    }

    public static Document byUserIdAndTags(String userId, List<String> tags) {
        return byUserId(userId).append(Fields.tags, doc(Ops.all, tags));
    }

    @Nullable
    public static Item from(@Nullable Document doc) {

        return doc == null ? null : Item.builder()
                .id(doc.getObjectId(CommonFields._id).toString())
                .userId(doc.getObjectId(Fields.userId).toString())
                .title(doc.getString(Fields.title))
                .url(doc.getString(Fields.url))
                .image(doc.getString(Fields.image))
                .notes(doc.getString(Fields.notes))
                .score(doc.getInteger(Fields.score))
                .tags(doc.getList(Fields.tags, String.class))
                .build();
    }

    @Nullable
    public static Document from(@Nullable Item item) {

        return item == null ? null : doc()
                .append(Fields.userId, new ObjectId(item.getUserId()))
                .append(Fields.title, item.getTitle())
                .append(Fields.url, item.getUrl())
                .append(Fields.image, item.getImage())
                .append(Fields.notes, item.getNotes())
                .append(Fields.score, item.getScore())
                .append(Fields.tags, item.getTags());
    }
}
