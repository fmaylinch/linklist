package com.codethen.linklist.db;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import javax.inject.Singleton;

@Singleton
public class MongoService {

    private final MongoClient mongoClient;
    private final MongoDatabase database;

    public MongoService(MongoClient mongoClient) {
        this.mongoClient = mongoClient;
        this.database = mongoClient.getDatabase("linklist");
    }

    public MongoCollection<Document> getCollection(String name) {
        return database.getCollection(name);
    }
}
