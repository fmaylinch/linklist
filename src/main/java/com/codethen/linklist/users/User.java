package com.codethen.linklist.users;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor

public class User {

    String id;
    String username;
    String password;
}
