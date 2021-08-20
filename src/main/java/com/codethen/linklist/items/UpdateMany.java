package com.codethen.linklist.items;

import java.util.List;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor

public class UpdateMany {

    List<String> tagsToSearch;
    List<String> tagsToAdd;
    List<String> tagsToRemove;
}
