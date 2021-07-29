import { Avatar, ListItemAvatar } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { styled } from '@material-ui/core/styles';

const MyAvatar = styled(Avatar)({
  borderRadius: 0
});

const MyListItemText = styled(ListItemText)({
  '& .tags': {
    color: "#bbbbbb"
  }
});

export default function ItemList({items, openItem}) {  

  function itemDetails(item) {
    return (
      <>
        <span className="notes">{item.notes}</span>
        {item.tags.length
          ? <span className="tags"><br/>#{item.tags.join(" #")}</span>
          : ""}
      </>
    );
  }

  return (
    items.map(item => (
      <ListItem button key={item.id} onClick={() => openItem(item)}>
        {/*
          <ListItemAvatar>
            <MyAvatar src={item.image} />
          </ListItemAvatar>
        */}
        <MyListItemText primary={item.title} secondary={itemDetails(item)} />
      </ListItem>
    ))
  );
}
