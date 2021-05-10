package com.codethen.linklist.items;

import com.codethen.linklist.db.MongoService;
import com.codethen.linklist.db.MongoUtil;
import com.codethen.linklist.db.MongoUtil.CommonFields;
import com.codethen.linklist.db.MongoUtil.Ops;
import com.codethen.linklist.security.Roles;
import com.codethen.linklist.security.User;
import com.codethen.linklist.users.UserService;
import com.codethen.linklist.util.SecurityUtil;
import com.codethen.linklist.util.Util;
import com.mongodb.client.MongoCollection;
import org.bson.Document;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.util.List;

import static com.codethen.linklist.items.ItemAdapter.*;

@Path("items")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ItemsApi {

    private final MongoCollection<Document> items;

    @Inject UserService userService;

    public ItemsApi(MongoService mongoService) {
        items = mongoService.getCollection("items");
    }

    @POST @Path("search")
    @RolesAllowed({ Roles.USER })
    public SearchResult search(@Context SecurityContext ctx, Search search) {

        final String userId = SecurityUtil.getUserId(ctx);

        final User searchedUser = userService.findByUsername(search.username);

        if (searchedUser == null) {
            throw new WebApplicationException("User not found: " + search.username, Response.Status.NOT_FOUND);
        }

        if (!searchedUser.getId().equals(userId)) {
            if (Util.isEmpty(search.tags) || !isAllowed(userId, searchedUser.getId(), search.tags)) {
                throw new WebApplicationException("Access denied", Response.Status.UNAUTHORIZED);
            }
        }

        final Document query = Util.isEmpty(search.tags) ?
                byUserId(searchedUser.getId()) : byUserIdAndTags(searchedUser.getId(), search.tags);

        final List<Item> items = MongoUtil.iterableToList(this.items.find(query), ItemAdapter::from);

        return SearchResult.builder().items(items).build();
    }

    @POST @Path("upsertOne")
    @RolesAllowed({ Roles.USER })
    public Item upsertOne(@Context SecurityContext ctx, Item item) {

        if (Util.isEmpty(item.getTitle()))
            throw new WebApplicationException("At least title is required", Response.Status.BAD_REQUEST);

        final String userId = SecurityUtil.getUserId(ctx);
        item.setUserId(userId);
        final Document doc = ItemAdapter.from(item);
        assert doc != null;

        if (item.getId() != null) {
            items.updateOne(byIdAndUserId(item.getId(), userId), new Document(Ops.set, doc));
        } else {
            items.insertOne(doc);
            item.setId(doc.getObjectId(CommonFields._id).toString());
        }

        return item;
    }

    @POST @Path("getOne")
    @RolesAllowed({ Roles.USER })
    public Item getOne(@Context SecurityContext ctx, ItemId itemId) {

        final Document doc = items.find(byIdAndUserId(itemId.getId(), SecurityUtil.getUserId(ctx))).first();
        return ItemAdapter.from(doc);
    }

    @POST @Path("deleteOne")
    @RolesAllowed({ Roles.USER })
    public Item deleteOne(@Context SecurityContext ctx, ItemId itemId) {

        final Item item = getOne(ctx, itemId);
        if (item != null) {
            items.deleteOne(byIdAndUserId(itemId.getId(), SecurityUtil.getUserId(ctx)));
        }

        return item;
    }

    private boolean isAllowed(String userId, String targetUserId, List<String> tags) {
        // TODO look for permission allowing userId on targetUserId tags
        return false;
    }

}
