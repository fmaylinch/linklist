package com.codethen.telegram.lanxatbot.translate;

import java.util.List;

import javax.annotation.Nullable;

public class DetectRequest {

    public String text;
    @Nullable
    public List<String> possibleLangs;
    public String apiKey;
}
