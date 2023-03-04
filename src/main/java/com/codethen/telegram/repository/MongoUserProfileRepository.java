package com.codethen.telegram.repository;

import java.util.Date;

import javax.annotation.Nullable;

import com.codethen.telegram.lanxatbot.profile.UserProfile;
import com.codethen.telegram.lanxatbot.profile.UserProfileRepository;
import com.mongodb.reactivestreams.client.MongoClient;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;

public class MongoUserProfileRepository implements UserProfileRepository {

    private static final String COLLECTION_NAME = "users";

    private final ReactiveMongoTemplate mongoTemplate;

    public MongoUserProfileRepository(MongoClient mongoClient, String databaseName) {
        mongoTemplate = new ReactiveMongoTemplate(mongoClient, databaseName);
    }

    @Nullable
    @Override
    public UserProfile getProfileById(Long userId) {

        System.out.println("Loading profile from database: " + userId);

        return mongoTemplate.findById(userId, UserProfile.class, COLLECTION_NAME).block();
    }

    @Override
    public void saveOrUpdate(UserProfile profile) {

        // I'm using the created date also to know whether I should insert or save
        if (profile.getCreated() == null) {
            System.out.println("Inserting new profile into database: " + profile);
            profile.setCreated(new Date());
            mongoTemplate.insert(profile, COLLECTION_NAME).block();
        } else {
            System.out.println("Updating existing profile into database: " + profile);
            mongoTemplate.save(profile, COLLECTION_NAME).block();
        }
    }
}
