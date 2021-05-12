package com.codethen.linklist.items;

import javax.ws.rs.FormParam;
import java.io.File;

public class ItemsUpload {

    @FormParam("file")
    public File file;

    @FormParam("tags")
    public String tags;
}
