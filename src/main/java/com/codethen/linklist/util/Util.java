package com.codethen.linklist.util;

import java.util.Collection;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;

public class Util {

    public static boolean isEmpty(Collection<?> collection) {
        return collection == null || collection.isEmpty();
    }

    public static boolean isEmpty(String str) {
        return str == null || str.isEmpty();
    }

    public static WebApplicationException apiError(Object entity, Response.Status status) {
        throw new WebApplicationException(Response.status(status).entity(entity).build());
    }
}
