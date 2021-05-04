package com.codethen.linklist.security;

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

import javax.inject.Singleton;

@Singleton
public class PasswordEncoder {

    private final Argon2PasswordEncoder passwordEncoder;

    public PasswordEncoder() {
        // For these parameters see the white paper (https://github.com/P-H-C/phc-winner-argon2/blob/master/argon2-specs.pdf), Section 9
        int saltLength = 128 / 8; // 128 bits
        int hashLength = 256 / 8; // 256 bits
        int parallelism = 1;
        int memoryInKb = 10 * 1024; // 10 MB
        int iterations = 10;
        passwordEncoder = new Argon2PasswordEncoder(saltLength, hashLength, parallelism, memoryInKb, iterations);
    }

    public String encode(String password) {
        return passwordEncoder.encode(password);
    }

    public boolean verify(String clearPassword, String hashedPassword) {
        return passwordEncoder.matches(clearPassword, hashedPassword);
    }
}
