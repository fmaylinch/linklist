package com.codethen.linklist.metadata;

import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.codethen.linklist.items.Item;

@Path("metadata")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class MetadataApi {

    @Inject MetadataScraper metadataScraper;

    @POST
    @Path("getFromUrl")
    public Item getFromUrl(MetadataRequest request) {
        return metadataScraper.itemDataFromUrl(request.getUrl());
    }
}
