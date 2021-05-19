package com.codethen.linklist.items;

import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

import com.codethen.linklist.db.MongoService;
import com.codethen.linklist.db.MongoUtil;
import com.codethen.linklist.db.MongoUtil.CommonFields;
import com.codethen.linklist.db.MongoUtil.Ops;
import com.codethen.linklist.permissions.Permission;
import com.codethen.linklist.permissions.PermissionService;
import com.codethen.linklist.security.Roles;
import com.codethen.linklist.users.User;
import com.codethen.linklist.users.UserService;
import com.codethen.linklist.util.Util;
import com.mongodb.client.MongoCollection;
import com.mongodb.lang.Nullable;
import com.opencsv.CSVReader;
import org.bson.Document;
import org.jboss.logging.Logger;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

import static com.codethen.linklist.items.ItemAdapter.byIdAndUserId;
import static com.codethen.linklist.items.ItemAdapter.byUserId;
import static com.codethen.linklist.items.ItemAdapter.byUserIdAndTags;
import static com.codethen.linklist.util.SecurityUtil.getUserId;

@Path("items")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ItemsApi {

    private final MongoCollection<Document> items;

    @Inject UserService userService;
    @Inject PermissionService permissionService;

    @Inject Logger log;

    public ItemsApi(MongoService mongoService) {
        items = mongoService.getCollection("items");
    }

    @POST @Path("search")
    @PermitAll
    public SearchResult search(@Context SecurityContext ctx, Search search) {

        final String userId = getUserId(ctx);

        final User searchedUser = userService.findByUsername(search.username);

        if (searchedUser == null) {
            throw Util.apiError("User not found: " + search.username, Response.Status.NOT_FOUND);
        }

        if (!searchedUser.getId().equals(userId)) {
            if (Util.isEmpty(search.tags) || !isAllowed(userId, searchedUser.getId(), search.tags)) {
                throw Util.apiError("Access denied", Response.Status.UNAUTHORIZED);
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
        return upsertItem(item, getUserId(ctx));
    }

    /**
     * Updates or inserts an {@link Item}.
     *
     * @param item   item to upsert (if {@link Item#getId()} is null, we're inserting a new item)
     * @param userId user that is performing the upsert
     * @return {@link Item} created or modified
     */
    private Item upsertItem(Item item, String userId) {

        if (Util.isEmpty(item.getTitle()))
            throw Util.apiError("At least title is required", Response.Status.BAD_REQUEST);

        if (Util.isEmpty(item.getId())) {
            item.setUserId(userId); // It's a new item. Set owner.
        } else {
            // It's an existing item. Only the same user can modify it.
            if (!userId.equals(item.getUserId())) {
                throw Util.apiError("Access denied", Response.Status.UNAUTHORIZED);
            }
        }

        if (item.score < 0 || item.score > 100) {
            item.setScore(Item.DEFAULT_SCORE);
        }

        final Document doc = ItemAdapter.from(item);
        assert doc != null;

        if (item.getId() != null) {
            items.updateOne(byIdAndUserId(item.getId(), item.getUserId()), new Document(Ops.set, doc));
        } else {
            items.insertOne(doc);
            item.setId(doc.getObjectId(CommonFields._id).toString());
        }

        return item;
    }

    @POST @Path("getOne")
    @RolesAllowed({ Roles.USER })
    public Item getOne(@Context SecurityContext ctx, ItemId itemId) {
        final Document doc = items.find(byIdAndUserId(itemId.getId(), getUserId(ctx))).first();
        return ItemAdapter.from(doc);
    }

    @POST @Path("deleteOne")
    @RolesAllowed({ Roles.USER })
    public Item deleteOne(@Context SecurityContext ctx, ItemId itemId) {
        final Item item = getOne(ctx, itemId);
        if (item != null) {
            items.deleteOne(byIdAndUserId(itemId.getId(), getUserId(ctx)));
        }
        return item;
    }

    @POST @Path("/import")
    @RolesAllowed({ Roles.USER })
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public ItemsUploadResponse fileUpload(@Context SecurityContext ctx, @MultipartForm ItemsUpload upload) {

        final var commonTags = parseTags(upload.tags);
        final String userId = getUserId(ctx);
        final File csvFile = upload.file;

        final String error = importItemsFromCsv(csvFile, commonTags, userId);

        return ItemsUploadResponse.builder()
                .error(error)
                .build();
    }

    /**
     * Imports {@link Item}s from a CSV file.
     *
     * @param csvFile     csv with items to create
     * @param commonTags  tags that will be added to all items
     * @param userId      user that creates the items
     * @return error message, or null if ok
     */
    private String importItemsFromCsv(File csvFile, Collection<String> commonTags, String userId) {
        try {
            final CSVReader csvReader = new CSVReader(new FileReader(csvFile));

            String[] row = csvReader.readNext();
            final var expectedHeader = List.of("title", "url", "image", "notes", "tags", "score");
            final var rowFirstColumns = Arrays.asList(row).subList(0, expectedHeader.size());
            if (!rowFirstColumns.equals(expectedHeader)) {
                return "CSV must have a header with these columns: " + String.join(",", expectedHeader);
            }

            while ((row = csvReader.readNext()) != null) {
                final String title = cleanString(row[0]);
                if (title == null) {
                    log.warn("Ignored row without title: " + Arrays.toString(row));
                    continue;
                }

                final Item item = Item.builder()
                        .title(title)
                        .url(cleanString(row[1]))
                        .image(cleanString(row[2]))
                        .notes(cleanString(row[3]))
                        .tags(joinLists(commonTags, parseTags(row[4])))
                        .score(parseScore(row[5]))
                        .build();

                upsertItem(item, userId);

                log.info("Inserted item " + item.getId() + " with data: " + Arrays.toString(row));
            }
            return null;

        } catch (Exception e) {
            return e.getMessage();
        }
    }

    private List<String> joinLists(Collection<String> col1, Collection<String> col2) {
        final var result = new ArrayList<>(col1);
        result.addAll(col2);
        return result;
    }

    private int parseScore(String rawScore) {
        final String scoreStr = cleanString(rawScore);
        try {
            return scoreStr == null ? Item.DEFAULT_SCORE : Integer.parseInt(scoreStr);
        } catch (NumberFormatException e) {
            return Item.DEFAULT_SCORE;
        }
    }

    private Collection<String> parseTags(String rawTags) {
        rawTags = cleanString(rawTags);
        if (rawTags == null) {
            return Collections.emptyList();
        }
        final String[] specificTags = rawTags.split("[ ,]+");
        return Arrays.asList(specificTags);
    }

    private String cleanString(String str) {
        final String trimmed = str.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Checks that there is a {@link Permission} allowing userId (could be null if anonymous) to targetUserId's tags.
     *
     * @param userId        user that wants to access items
     * @param targetUserId  target user that may allow access
     * @param tags          tags that userId wants to see
     */
    private boolean isAllowed(@Nullable String userId, String targetUserId, List<String> tags) {

        final Permission permission = permissionService.findAllowingPermission(userId, targetUserId, tags);
        return permission != null;
    }

}
