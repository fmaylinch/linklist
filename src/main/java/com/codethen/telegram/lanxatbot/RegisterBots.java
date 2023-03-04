package com.codethen.telegram.lanxatbot;

import com.codethen.telegram.lanxatbot.profile.UserProfileRepository;
import com.codethen.telegram.lanxatbot.search.SearchRepository;
import com.codethen.telegram.lanxatbot.translate.GoogleTranslateService;
import com.codethen.telegram.repository.CachedUserProfileRepository;
import com.codethen.telegram.repository.MongoSearchRepository;
import com.codethen.telegram.repository.MongoUserProfileRepository;
import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.generics.BotSession;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

public class RegisterBots {

    private static BotSession botSession = null;

    public static BotSession getBotSession() {
        return botSession;
    }

    public static void registerBots(String connectionString, String databaseName, String botName, String lanxatApiToken) throws TelegramApiException {

        System.out.println("Registering bots...");

        final TelegramBotsApi api = new TelegramBotsApi(DefaultBotSession.class);

        final MongoClient mongoClient = MongoClients.create(connectionString);

        final UserProfileRepository userProfileRepository =
                new CachedUserProfileRepository(new MongoUserProfileRepository(
                    mongoClient, databaseName));

        final SearchRepository searchRepository =
            new MongoSearchRepository(mongoClient, databaseName);

        RegisterBots.botSession = api.registerBot(
                new LanXatTelegramBot(
                        botName,
                        lanxatApiToken,
                        //new YandexTranslateService(YandexApiFactory.build()),
                        new GoogleTranslateService(),
                        userProfileRepository,
                        searchRepository));

        System.out.println("Bot registered: " + botName);
    }

    private static String getEnvChecked(String name) {
        final String value = System.getenv(name);
        if (value == null) {
            throw new IllegalArgumentException("Missing environment variable: " + name);
        }
        return value;
    }
}
