import { useState, useEffect, useContext } from "react";
import { Switch, Route, useHistory } from "react-router-dom";

import { UserContext } from "./components/UserContext";
import ItemDetail from "./components/ItemDetail";
import ItemList from "./components/ItemList";
import Options from "./components/Options";
import Login from "./components/Login";
import { myAxios } from "./util/axios-util";

export default function App() {

  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState(null);

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

  useEffect(() => {
    console.log("Checking user...");
    if (!user) {
      history.push("/login");
    } else {
      loadItems().then(items => setItems(items));
    }
  }, [user, history]);

  return (
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
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
            { items
              ? <ItemList items={items} openItem={openItem} />
              : <div>Loading items...</div>
            }
          </Route>
        </Switch>
      </div>
  );
}
