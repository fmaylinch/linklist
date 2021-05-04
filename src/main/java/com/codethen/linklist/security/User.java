package com.codethen.linklist.security;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor

public class User {

    String id;
    String username;
    String password;
}
