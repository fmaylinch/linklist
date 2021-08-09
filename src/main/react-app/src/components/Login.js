import { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { UserContext } from './UserContext';
import { myAxios, setAxiosToken } from '../util/axios-util';
import { Button, TextField, Container } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { styled } from '@material-ui/core/styles';
import Cookies from "js-cookie";

const COOKIE_CREDENTIALS = "linklist.react.credentials";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [alert, setAlert] = useState(null);

  const { setUser } = useContext(UserContext);
  const history = useHistory();

  function loginOrRegister() {
    let action;
    if (!password2) {
      action = "login";
    } else if (password === password2) {
      action = "register";
    } else {
      setAlert({severity:"error", text:"Passwords don't match"});
      return;
    }
    setAlert({severity:"info", text:"Trying " + action});
    const loginData = {username, password, password2};
    myAxios
      .post("security/" + action, loginData)
      .then(resp => handleCredentials(resp.data))
      .catch(e => setAlert({severity:"error", text:e}));
  }

  useEffect(() => {
    const cookie = Cookies.get(COOKIE_CREDENTIALS);
    if (cookie) {
      const creds = JSON.parse(cookie);
      console.log("Cookie found for user", creds.username);
      handleCredentials(creds);
    } else {
      console.log("Cookie not found");
    }
  }, []);

  function handleCredentials(creds) {
    setAlert(null);
    setAxiosToken(creds.token);
    Cookies.set(COOKIE_CREDENTIALS, JSON.stringify(creds), { sameSite: "strict", expires: 30 });
    setUser(creds);
    history.replace("/");
  }

  const LoginButton = styled(Button)({
    margin: '20px 0',
  });

  return (
    <Container maxWidth="sm">
      <h1>Linklist</h1>
      <div>
        <TextField label="username" fullWidth
          value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div>
        <TextField label="password" type="password" fullWidth 
          value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div>
        <TextField label="repeat password to register" type="password" fullWidth
          value={password2} onChange={e => setPassword2(e.target.value)} />
      </div>
      <div>
        <LoginButton variant="contained" color="primary"
          onClick={loginOrRegister}>Login</LoginButton>
      </div>
      <div>
        { alert ? <Alert severity={alert.severity}>{alert.text}</Alert> : "" }
      </div>
    </Container>
  );
}
