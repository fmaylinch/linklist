import { useState, useEffect, useContext } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { Alert } from '@material-ui/lab';
import { UserContext } from "./components/UserContext";
import ItemDetail from "./components/ItemDetail";
import ItemList from "./components/ItemList";
import Options from "./components/Options";
import Login from "./components/Login";
import { myAxios } from "./util/axios-util";
import Util from './util/util';

export default function App() {

  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState(null);
  const [alert, setAlert] = useState(null);
  const [sort, setSort] = useState({ property: "title", direction: 1 });

  const history = useHistory();
  const { user } = useContext(UserContext);

  function openItem(item) {
    setSelectedItem(item);
    history.push("/item");
  }

  async function loadItems() {
    const search = { username: user.username }; // TODO: may contain list of tags
    const resp = await myAxios
      .post("items/search", search)
      .catch(e => console.log(e));
    return resp.data.items;
  }

  function createSortFunction() {
    return (x,y) => {
      if (x[sort.property] < y[sort.property]) return -sort.direction;
      if (x[sort.property] > y[sort.property]) return sort.direction;
      return 0;
    };
  }

  useEffect(() => {
    if (!user) {
      history.push("/login");
    } else {
      setAlert({severity:"info", text:"Loading items"});
      loadItems().then(items => {
        setAlert(null);
        items.forEach(item => Util.fillItemRawContent(item));
        items.sort(createSortFunction());
        setItems(items);
      });
    }
  }, [user, history]);

  return (
      <div>
        {/* <Switch> renders the first <Route> that matches the current URL */}
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/options">
            <Options />
          </Route>
          <Route path="/item">
            {/* Passing the item object, so we don´t use path params */}
            <ItemDetail item={selectedItem} />
          </Route>
          <Route path="/">
            { alert ? <Alert severity={alert.severity}>{alert.text}</Alert> : "" }
            { items ? <ItemList items={items} openItem={openItem} /> : "" }
          </Route>
        </Switch>
      </div>
  );
}
