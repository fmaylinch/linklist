import {
  AppBar, Avatar, IconButton, InputBase, ListItemAvatar,
  TextField, Toolbar, Typography
} from '@material-ui/core';
import { alpha, makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { styled } from '@material-ui/core/styles';
import {AccountCircle} from '@material-ui/icons';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';

const MyAvatar = styled(Avatar)({
  borderRadius: 0
});

const MyListItemText = styled(ListItemText)({
  '& .tags': {
    color: "#bbbbbb"
  }
});

// The AppBar example and its styles were taken from:
// https://material-ui.com/components/app-bar/#app-bar-with-a-primary-search-field
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    width: 'auto',
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`
  },
  sectionDesktop: {
    display: 'flex',
  },
}));

function itemRow(item) {
  return (
    <>
      <span className="notes">{item.notes}</span>
      {item.tags.length
        ? <span className="tags"><br/>#{item.tags.join(" #")}</span>
        : ""}
    </>
  );
}

function itemList(items, openItem) {
  return items.map(item => (
    <ListItem button key={item.id} onClick={() => openItem(item)}>
      <ListItemAvatar>
        <MyAvatar src={item.image} />
      </ListItemAvatar>
      <MyListItemText primary={item.title} secondary={itemRow(item)} />
    </ListItem>
  ))
}

function appBar(classes) {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <div className={classes.search}>
          <div className={classes.searchIcon}>
            <SearchIcon />
          </div>
          <InputBase
            placeholder="Search…"
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            inputProps={{ 'aria-label': 'search' }}
          />
        </div>
        <div className={classes.grow} />
        <div className={classes.sectionDesktop}>
          {/* TODO: add icons: add item, sort items, options */}
          <IconButton color="inherit">
            <MailIcon />
          </IconButton>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton edge="end" color="inherit">
            <AccountCircle />
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default function ItemList({items, openItem}) {
  const classes = useStyles();
  return (
      <div>
        {appBar(classes)}
        {itemList(items, openItem)}
      </div>
  );
}