package com.codethen.linklist.security;

import com.codethen.linklist.users.UserService;
import io.smallrye.jwt.build.Jwt;
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

@Path("security")
@Produces(MediaType.APPLICATION_JSON)
public class SecurityApi {

    @Inject UserService userService;
    @Inject PasswordEncoder passwordEncoder;

    public SecurityApi() {
    }

    @POST
    @Path("login")
    public Credentials login(Login login) {
        final User user = userService.findByUsername(login.getUsername());
        checkLogin(login, user);
        return new Credentials(user.getUsername(), getJwtToken(user));
    }

    private void checkLogin(Login login, User user) {
        if (user == null || !passwordEncoder.verify(login.getPassword(), user.getPassword())) {
            throw new WebApplicationException("Wrong credentials", Response.Status.UNAUTHORIZED);
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
        if (userService.findByUsername(register.getUsername()) != null) {
            throw new WebApplicationException("User already exists", Response.Status.FORBIDDEN);
        }
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
        final String encodedPwd = passwordEncoder.encode(register.getPassword());
        final User user = User.builder()
                .username(register.getUsername())
                .password(encodedPwd)
                .build();
        return userService.createUser(user);
    }
}
