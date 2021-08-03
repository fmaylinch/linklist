import {AppBar, IconButton, TextField, Toolbar, Typography} from '@material-ui/core';
import {Add as AddIcon, Settings as SettingsIcon} from '@material-ui/icons';
import {useState} from 'react';
import styled from '@emotion/styled';

const ItemRowDiv = styled.div`
  margin: 10px 0;
  border-bottom: 1px #d5d5d5 solid;
  & > .title {
    font-weight: 400;
  }
  & > .notes {
    font-weight: 300;
    color: #bbbbbb;
  }
  & > .tags {
    color: #aaaaaa;
  }
`;

function getFilteredItems(query, items) {

  if (!query) return items;

  const parts = query.split(/ +/)
    .map(x => x[0] === "#" ? x + " " : x); // Add space at the end of tag, for exact search

  return items.filter(item => {
    for (let part of parts) {
      // Search for all parts
      if (item.rawContent.indexOf(part) < 0) return false;
    }
    return true;
  });
}

export default function ItemList({items, openItem}) {

  const [query, setQuery] = useState("");

  function searchBar() {
    return (
      <div>
        <TextField fullWidth label="search" value={query} onChange={e => setQuery(e.target.value)} />
      </div>
    );
  }

  function itemList(filteredItems) {
    return filteredItems.map(item => (
      <ItemRowDiv item={item} key={item.id} onClick={() => openItem(item)}>
        <div className="title">{item.title}</div>
        <div className="notes">{item.notes}</div>
        {item.tags.length
          ? <div className="tags">#{item.tags.join(" #")}</div>
          : ""}
      </ItemRowDiv>
    ));
  }

  const cleanQuery = query ? query.trim().toLowerCase() : "";

  const filteredItems = getFilteredItems(cleanQuery, items);

  const appBarInfo = cleanQuery
    ? filteredItems.length + " of " + items.length
    : items.length;

  return (
      <>
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              LinkList
            </Typography>
            <Typography color="inherit"
                style={{fontWeight: "300", fontSize: "14px", marginLeft: "10px", flexGrow: 1}}>
              {appBarInfo}
            </Typography>
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
            <IconButton edge="end" color="inherit">
              <AddIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div style={{margin: "0 10px"}}>
          {searchBar()}
          {itemList(filteredItems)}
        </div>
      </>
  );
}
