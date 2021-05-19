package com.codethen.linklist.permissions;

import java.util.List;
import java.util.stream.Collectors;

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

import com.codethen.linklist.security.Roles;
import com.codethen.linklist.users.User;
import com.codethen.linklist.users.UserService;
import com.codethen.linklist.util.Util;
import org.jboss.logging.Logger;

import static com.codethen.linklist.util.SecurityUtil.getUserId;

@Path("permissions")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PermissionsApi {

    @Inject PermissionService permissionService;
    @Inject UserService userService;

    @Inject Logger log;

    public PermissionsApi() {
    }

    @POST @Path("search")
    @RolesAllowed({ Roles.USER })
    public SearchResult search(@Context SecurityContext ctx) {
        final List<Permission> permissions = permissionService.findByUserId(getUserId(ctx));
        return SearchResult.builder().permissions(permissions).build();
    }

    @POST @Path("upsertOne")
    @RolesAllowed({ Roles.USER })
    public Permission upsertOne(@Context SecurityContext ctx, Permission permission) {
        return upsertPermission(permission, getUserId(ctx));
    }

    /**
     * Updates or inserts an {@link Permission}.
     *
     * @param permission   permission to upsert (if {@link Permission#getId()} is null, we're inserting a new one)
     * @param userId       user that is performing the upsert
     * @return {@link Permission} created or modified
     */
    private Permission upsertPermission(Permission permission, String userId) {

        if (Util.isEmpty(permission.getTags()))
            throw Util.apiError("At least one tag is required", Response.Status.BAD_REQUEST);

        if (Util.isEmpty(permission.getId())) {
            permission.setUserId(userId); // It's a new permission. Set owner.
        } else {
            // It's an existing permission. Only the same user can modify it.
            if (!userId.equals(permission.getUserId())) {
                throw Util.apiError("Access denied", Response.Status.UNAUTHORIZED);
            }
        }

        permission.setUserIds(getUserIds(permission.getUsernames()));

        return permissionService.upsert(permission);
    }

    private List<String> getUserIds(List<String> usernames) {
        final List<String> userIds = usernames.stream()
                .map(username -> {
                    final User user = userService.findByUsername(username);
                    if (user == null) {
                        throw Util.apiError("User not found: " + username, Response.Status.NOT_FOUND);
                    }
                    return user.getId();
                })
                .collect(Collectors.toList());
        return userIds;
    }

    @POST @Path("getOne")
    @RolesAllowed({ Roles.USER })
    public Permission getOne(@Context SecurityContext ctx, PermissionId permissionId) {
        final Permission permission = permissionService.findOne(permissionId.getId());
        return permission.getUserId().equals(getUserId(ctx)) ? permission : null;
    }

    @POST @Path("deleteOne")
    @RolesAllowed({ Roles.USER })
    public Permission deleteOne(@Context SecurityContext ctx, PermissionId permissionId) {
        final Permission permission = getOne(ctx, permissionId);
        if (permission != null) {
            permissionService.deleteOne(permission.getId());
        }
        return permission;
    }
}
