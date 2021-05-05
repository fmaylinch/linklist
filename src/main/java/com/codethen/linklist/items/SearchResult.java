package com.codethen.linklist.items;

import java.util.List;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor

public class SearchResult {

    List<Item> items;
}
