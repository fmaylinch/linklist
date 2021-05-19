package com.codethen.linklist.permissions;

import java.util.Collections;
import java.util.List;

import javax.inject.Singleton;

import com.codethen.linklist.db.MongoService;
import com.codethen.linklist.db.MongoUtil;
import com.codethen.linklist.db.MongoUtil.Ops;
import com.mongodb.client.MongoCollection;
import com.mongodb.lang.Nullable;
import org.bson.Document;

import static com.codethen.linklist.db.MongoUtil.byId;
import static com.codethen.linklist.permissions.PermissionAdapter.byAccess;
import static com.codethen.linklist.permissions.PermissionAdapter.byIdAndUserId;
import static com.codethen.linklist.permissions.PermissionAdapter.byUserId;

@Singleton
public class PermissionService {

    private final MongoCollection<Document> permissions;

    public PermissionService(MongoService mongoService) {
        permissions = mongoService.getCollection("permissions");
    }

    public List<Permission> findByUserId(String userId) {
        return MongoUtil.iterableToList(this.permissions.find(byUserId(userId)), PermissionAdapter::from);
    }

    public Permission upsert(Permission permission) {

        Collections.sort(permission.getTags()); // Tags are always stored sorted, for easy comparing

        final Document doc = PermissionAdapter.from(permission);
        assert doc != null;

        if (permission.getId() != null) {
            permissions.updateOne(byIdAndUserId(permission.getId(), permission.getUserId()), new Document(Ops.set, doc));
        } else {
            permissions.insertOne(doc);
            permission.setId(doc.getObjectId(MongoUtil.CommonFields._id).toString());
        }

        return permission;
    }

    public Permission findOne(String permissionId) {
        final Document doc = permissions.find(byId(permissionId)).first();
        return PermissionAdapter.from(doc);
    }

    public void deleteOne(String permissionId) {
        permissions.deleteOne(byId(permissionId));
    }

    public Permission findAllowingPermission(@Nullable String userId, String targetUserId, List<String> tags) {
        final Document doc = permissions.find(byAccess(userId, targetUserId, tags)).first();
        return PermissionAdapter.from(doc);
    }
}