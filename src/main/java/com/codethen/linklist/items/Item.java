package com.codethen.linklist.items;

import java.util.List;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor

public class Item {

    String id;
    String userId;
    String title;
    String url;
    String image;
    String notes;
    List<String> tags;
}
