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
import com.opencsv.CSVReader;
import org.bson.Document;
import org.jboss.logging.Logger;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.io.File;
import java.io.FileReader;
import java.util.*;

import static com.codethen.linklist.items.ItemAdapter.*;

@Path("items")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ItemsApi {

    private final MongoCollection<Document> items;

    @Inject UserService userService;

    @Inject Logger log;

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

        upsertItem(item);

        return item;
    }

    private void upsertItem(Item item) {
        final Document doc = ItemAdapter.from(item);
        assert doc != null;

        if (item.getId() != null) {
            items.updateOne(byIdAndUserId(item.getId(), item.getUserId()), new Document(Ops.set, doc));
        } else {
            items.insertOne(doc);
            item.setId(doc.getObjectId(CommonFields._id).toString());
        }
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

    @POST @Path("/import")
    @RolesAllowed({ Roles.USER })
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public ItemsUploadResponse fileUpload(@Context SecurityContext ctx, @MultipartForm ItemsUpload upload) {

        final var commonTags = parseTags(upload.tags);
        final String userId = SecurityUtil.getUserId(ctx);
        final File csvFile = upload.file;

        final String error = importItemsFromCsv(csvFile, commonTags, userId);

        return ItemsUploadResponse.builder()
                .error(error)
                .build();
    }

    private String importItemsFromCsv(File csvFile, Collection<String> commonTags, String userId) {
        try {
            final CSVReader csvReader = new CSVReader(new FileReader(csvFile));

            String[] row = csvReader.readNext();
            final String[] expectedHeader = {"title", "url", "image", "notes", "tags", "score"};
            if (!Arrays.equals(row, expectedHeader)) {
                return "CSV must have this header row: " + String.join(",", expectedHeader);
            }

            while ((row = csvReader.readNext()) != null) {
                final String title = cleanString(row[0]);
                if (title == null) {
                    log.warn("Ignored row without title: " + Arrays.toString(row));
                    continue;
                }

                final var tags = new ArrayList<>(commonTags);
                final var specificTags = parseTags(row[4]);
                tags.addAll(specificTags);

                final String scoreStr = cleanString(row[5]);
                final int score = scoreStr == null ? 50 : Integer.parseInt(scoreStr);

                Item item = Item.builder()
                        .userId(userId)
                        .title(title)
                        .url(cleanString(row[1]))
                        .image(cleanString(row[2]))
                        .notes(cleanString(row[3]))
                        .tags(tags)
                        .score(score)
                        .build();

                upsertItem(item);

                log.info("Inserted item with data: " + Arrays.toString(row));
            }
            return null;

        } catch (Exception e) {
            return e.getMessage();
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

    private boolean isAllowed(String userId, String targetUserId, List<String> tags) {
        // TODO look for permission allowing userId on targetUserId tags
        return false;
    }

}
