package com.codethen.linklist.permissions;

import java.util.List;

import com.codethen.linklist.items.Item;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor

public class SearchResult {

    List<Permission> permissions;
}
