package com.codethen.linklist.security;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor

public class Credentials {

    String username;
    String token;
}
