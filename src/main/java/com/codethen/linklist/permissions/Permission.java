package com.codethen.linklist.permissions;

import java.util.List;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor

public class Permission {

    String id;
    String userId;
    List<String> tags;
    List<String> usernames;
    List<String> userIds;

    public boolean allUsersAllowed() {
        return userIds.isEmpty();
    }
}
