package com.codethen.linklist.util;

import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
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
import com.codethen.linklist.items.Item;
import com.codethen.linklist.items.ItemAdapter;
import com.codethen.linklist.items.ItemId;
import com.codethen.linklist.items.ItemsUpload;
import com.codethen.linklist.items.ItemsUploadResponse;
import com.codethen.linklist.items.Search;
import com.codethen.linklist.items.SearchResult;
import com.codethen.linklist.items.UpdateMany;
import com.codethen.linklist.permissions.Permission;
import com.codethen.linklist.permissions.PermissionService;
import com.codethen.linklist.security.Roles;
import com.codethen.linklist.users.User;
import com.codethen.linklist.users.UserService;
import com.mongodb.client.MongoCollection;
import com.mongodb.lang.Nullable;
import com.opencsv.CSVReader;
import org.bson.Document;
import org.jboss.logging.Logger;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

import static com.codethen.linklist.db.MongoUtil.doc;
import static com.codethen.linklist.items.ItemAdapter.byIdAndUserId;
import static com.codethen.linklist.items.ItemAdapter.byUserId;
import static com.codethen.linklist.items.ItemAdapter.byUserIdAndTags;
import static com.codethen.linklist.util.SecurityUtil.getUserId;

@Path("test")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class TestApi {

    @Inject Logger log;

    @GET @Path("message")
    @PermitAll
    public Message message() {
        return new Message("This is a test message from LinkList app");
    }

    @lombok.Value
    public static class Message {
        String title;
    }

}
