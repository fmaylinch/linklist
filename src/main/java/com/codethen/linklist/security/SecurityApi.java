package com.codethen.linklist.security;

import com.codethen.linklist.db.MongoUtil;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import io.smallrye.jwt.build.Jwt;
import org.bson.Document;
import org.eclipse.microprofile.jwt.Claims;

import javax.inject.Inject;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.time.Duration;
import java.util.Set;

import static com.codethen.linklist.security.UserAdapter.byUsername;

@Path("security")
@Produces(MediaType.APPLICATION_JSON)
public class SecurityApi {

    private final MongoCollection<Document> users;

    @Inject
    PasswordEncoder passwordEncoder;

    public SecurityApi(MongoClient mongoClient) {
        users = mongoClient.getDatabase("linklist").getCollection("users");
    }

    @POST
    @Path("login")
    public Credentials login(Login login) {
        final User user = findUserByUsername(login.getUsername());
        checkLogin(login, user);
        return new Credentials(user.getUsername(), getJwtToken(user));
    }

    private void checkLogin(Login login, User user) {
        if (user == null) {
            throw new WebApplicationException("User not found", Response.Status.UNAUTHORIZED);
        }
        if (!passwordEncoder.verify(login.getPassword(), user.getPassword())) {
            throw new WebApplicationException("Wrong password", Response.Status.UNAUTHORIZED);
        }
    }

    @POST
    @Path("register")
    public Credentials register(Register register) {
        checkRegistration(register);
        final User user = createUser(register);
        return new Credentials(user.getUsername(), getJwtToken(user));
    }

    private void checkRegistration(Register register) {
        if (!hasInfoToRegister(register)) {
            throw new WebApplicationException("Wrong or missing data", Response.Status.BAD_REQUEST);
        }
        if (findUserByUsername(register.getUsername()) != null) {
            throw new WebApplicationException("User already exists", Response.Status.FORBIDDEN);
        }
    }

    private User findUserByUsername(String username) {
        final Document doc = users.find(byUsername(username)).first();
        return UserAdapter.from(doc);
    }

    private boolean hasInfoToRegister(Register register) {
        return register.getUsername() != null
                && register.getUsername().length() >= 3
                && register.getPassword() != null
                && register.getPassword().length() >= 5
                && register.getPassword().equals(register.getPassword2());
    }

    private String getJwtToken(User user) {
        return Jwt.issuer("https://example.com/issuer")
                .upn(user.getId())
                .groups(Set.of(Roles.USER))
                .claim(Claims.nickname.name(), user.getUsername())
                .expiresIn(Duration.ofDays(30))
                .sign();
    }

    private User createUser(Register register) {
        final String hashedPwd = passwordEncoder.encode(register.getPassword());

        final User user = User.builder()
                .username(register.getUsername())
                .password(hashedPwd)
                .build();

        final Document doc = UserAdapter.from(user);
        users.insertOne(doc);
        user.setId(doc.getObjectId(MongoUtil.CommonFields._id).toString());

        return user;
    }
}
