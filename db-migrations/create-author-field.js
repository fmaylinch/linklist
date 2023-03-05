var items = db.items.find({tags:"album"});
items.forEach(item => {
  if (item.author) {
    return;
  }
  var dashIndex = item.title.indexOf(" - ");
  if (dashIndex > 0) {
    item.author = item.title.substring(0, dashIndex);
    item.title = item.title.substring(dashIndex + " - ".length);
    //print("Author: "  + item.author + ", Title: "  + item.title);
    db.items.save(item);
  } else {
    print("No dash found: " + item.title + " -- " + item._id)
  }
})
