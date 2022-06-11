package com.codethen.linklist.items;

import java.util.List;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor

public class Item {

    public static final int DEFAULT_SCORE = 50;
    public static final List<String> DEFAULT_TAGS = List.of("untagged");

    String id;
    String userId;
    String title;
    String url;
    String image;
    String notes;
    int score;
    List<String> tags;
}
