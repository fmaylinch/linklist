package com.codethen.linklist.util;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import com.codethen.telegram.lanxatbot.RegisterBots;
import org.eclipse.microprofile.config.ConfigProvider;
import org.jboss.logging.Logger;

@Path("test")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class TestApi {

    @Inject Logger log;

    @GET @Path("message")
    @PermitAll
    public Message message() {
        return new Message("Last change: Quarkus 2 - Java 17");
    }

    @GET @Path("bots")
    @PermitAll
    public Message bots() throws Exception {

        if (RegisterBots.getBotSession() != null) {
            return new Message("bots already registered");
        }

        final String connectionString = ConfigProvider.getConfig().getValue("mongo.url", String.class);
        final String databaseName = ConfigProvider.getConfig().getValue("mongo.database", String.class);
        final String telegramBotName = ConfigProvider.getConfig().getValue("telegram.lanxat.name", String.class);
        final String telegramBotApiToken = ConfigProvider.getConfig().getValue("telegram.lanxat.token", String.class);

        RegisterBots.registerBots(connectionString, databaseName, telegramBotName, telegramBotApiToken);

        return new Message("bots registered");
    }

    @GET @Path("files")
    @PermitAll
    public FolderInfo files(@QueryParam("path") String path) {
        var file = new File(path);
        if (!file.exists()) {
            return new FolderInfo("path doesn't exist: " + path, null);
        }
        if (!file.isDirectory()) {
            return new FolderInfo("path is not a directory: " + path, null);
        }
        var files = Arrays.stream(file.listFiles())
                .map(File::getName)
                .collect(Collectors.toList());
        return new FolderInfo("files in directory: " + path, files);
    }

    @lombok.Value
    public static class Message {
        String title;
    }

    @lombok.Value
    public static class FolderInfo {
        String message;
        List<String> files;
    }

}
