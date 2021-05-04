package com.codethen.linklist.security;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor

public class Register {

    private String username;
    private String password;
    private String password2;
}
