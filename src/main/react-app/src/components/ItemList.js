import { TextField } from '@material-ui/core';
import { useState } from 'react';
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

function ItemRow({item}) {
  return (
    <ItemRowDiv>
      <div className="title">{item.title}</div>
      <div className="notes">{item.notes}</div>
      {item.tags.length
        ? <div className="tags">#{item.tags.join(" #")}</div>
        : ""}
    </ItemRowDiv>
  );
}

export default function ItemList({items, openItem}) {

  const [query, setQuery] = useState("");
  //const classes = useStyles();

  function appBar() {
    return (
      <div>
        <TextField fullWidth label="search" value={query} onChange={e => setQuery(e.target.value)} />
      </div>
    );
  }

  function itemList() {

    const lowerQuery = query ? query.trim().toLowerCase() : "";
    const parts = lowerQuery.split(/ +/)
      .map(x => x[0] === "#" ? x + " " : x); // Add space at the end of tag, for exact search

    const searchedItems = items.filter(item => {
      for (let part of parts) {
        // Search for all parts
        if (item.rawContent.indexOf(part) < 0) return false;
      }
      return true;
    });

    return searchedItems.map(item => (
      <ItemRow item={item} key={item.id} onClick={() => openItem(item)} />
    ));
  }

  return (
      <div style={{margin: "0 10px"}}>
        {appBar()}
        {itemList()}
      </div>
  );
}
