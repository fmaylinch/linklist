package com.codethen.linklist.util;

import io.smallrye.jwt.algorithm.SignatureAlgorithm;
import io.smallrye.jwt.util.KeyUtils;
import org.eclipse.microprofile.config.ConfigProvider;
import org.eclipse.microprofile.jwt.Claims;
import org.eclipse.microprofile.jwt.JsonWebToken;

import javax.ws.rs.core.SecurityContext;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.Principal;
import java.security.PrivateKey;

public class SecurityUtil {

    public static JsonWebToken getJwt(SecurityContext ctx) {
        final Principal userPrincipal = ctx.getUserPrincipal();
        return (JsonWebToken) userPrincipal;
    }

    public static String getUserId(SecurityContext ctx) {
        final JsonWebToken jwt = getJwt(ctx);
        return jwt == null ? null : jwt.getClaim(Claims.upn.name());
    }

    public static PrivateKey getPrivateKey() {
        return getSigningKeyFromKeyContent(getPrivateKeyFromConfig());
    }

    private static PrivateKey getSigningKeyFromKeyContent(String privateKey) {
        try {
            return KeyUtils.decodePrivateKey(privateKey);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Can't decode private key (length: " + privateKey.length() + ")", e);
        }
    }

    private static PrivateKey getSigningKeyFromKeyLocation(String keyLocation) {
        try {
            SignatureAlgorithm alg = SignatureAlgorithm.RS256;
            Key key = readSigningKey(keyLocation, null, alg);
            if (key == null) {
                throw new RuntimeException("Key can't be read from: " + keyLocation);
            }
            if (!(key instanceof PrivateKey)) {
                throw new RuntimeException("Key at " + keyLocation + " is not PrivateKey but " + key.getClass());
            }
            return (PrivateKey) key;
        } catch (Exception e) {
            throw new RuntimeException("Key can't be read from: " + keyLocation, e);
        }
    }

    private static String getKeyLocationFromConfig() {
        var name = "smallrye.jwt.sign.key.location";
        var keyLocation = ConfigProvider.getConfig().getValue(name, String.class);
        if (keyLocation != null) {
            return keyLocation;
        } else {
            throw new RuntimeException("Config property not set: " + name);
        }
    }

    private static String getPrivateKeyFromConfig() {
        var name = "smallrye.jwt.sign.key";
        var key = ConfigProvider.getConfig().getValue(name, String.class);
        if (key != null) {
            return splitNewLines(key);
        } else {
            throw new RuntimeException("Config property not set: " + name);
        }
    }

    /**
     * Key will may come as one line with spaces, so we split the newlines to fix the PEM
     */
    private static String splitNewLines(String key) {
        var begin = "-----BEGIN PRIVATE KEY-----";
        var end = "-----END PRIVATE KEY-----";
        if (!key.startsWith(begin + " ")) {
            return key; // seems a correct key with newlines
        }
        var middle = key.substring(begin.length(), key.length() - end.length());
        return begin + middle.replaceAll(" ", "\n") + end;
    }

    private static Key readSigningKey(String location, String kid, SignatureAlgorithm alg) throws Exception {
        String content = readKeyContent(location);
        return KeyUtils.decodePrivateKey(content, alg);
    }

    static String readKeyContent(String keyLocation) throws Exception {
        StringWriter contents = new StringWriter();
        var input = new InputStreamReader(new FileInputStream(keyLocation));
        try (BufferedReader reader = new BufferedReader(input)) {
            String line;
            while ((line = reader.readLine()) != null) {
                contents.write(line);
            }
        }
        return contents.toString();
    }
}
