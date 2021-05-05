package com.codethen.linklist.util;

import org.eclipse.microprofile.jwt.Claims;
import org.eclipse.microprofile.jwt.JsonWebToken;

import javax.ws.rs.core.SecurityContext;
import java.security.Principal;

public class SecurityUtil {

    public static JsonWebToken getJwt(SecurityContext ctx) {
        final Principal userPrincipal = ctx.getUserPrincipal();
        return (JsonWebToken) userPrincipal;
    }

    public static String getUserId(SecurityContext ctx) {
        final JsonWebToken jwt = getJwt(ctx);
        return jwt.getClaim(Claims.upn.name());
    }
}
