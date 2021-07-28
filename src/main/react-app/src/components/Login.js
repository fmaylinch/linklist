import styled from '@emotion/styled'
import { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { UserContext } from './UserContext';
import { myAxios, setAxiosToken } from '../util/axios-util';

const Input = styled.input`
  font-size: 16px;
  padding: 5px;
  margin-bottom: 5px;
  width: 200px;
  display: block;
`;

const Button = styled.button`
  font-size: 16px;
  padding: 7px;
  margin-right: 10px;
  margin-bottom: 10px;
  color: white;
  background-color: rgb(79, 124, 163);
  &:hover {
    background-color: rgb(89, 138, 180);
  }
`;

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");

  const { setUser } = useContext(UserContext);
  const history = useHistory();

  function loginOrRegister() {
      let action;
      if (!password2) {
        action = "login";
      } else if (password === password2) {
        action = "register";
      } else {
        setMessage("Passwords don't match");
        return;
      }
      setMessage("Trying " + action);
      const loginData = {username, password, password2};
      myAxios
        .post("security/" + action, loginData)
        .then(resp => handleCredentials(resp.data))
        .catch(e => setMessage("Error: " + e));
    }

  function handleCredentials(creds) {
    console.log("Received credentials", creds);
    setMessage("");
    setAxiosToken(creds.token);
    setUser(creds);
    history.replace("/");
  }

  return (
    <div>
      <Input placeholder="user"
        value={username} onChange={e => setUsername(e.target.value)} />
      <Input placeholder="password" type="password" 
        value={password} onChange={e => setPassword(e.target.value)} />
      <Input placeholder="repeat password to register" type="password" 
        value={password2} onChange={e => setPassword2(e.target.value)} />
      <Button onClick={loginOrRegister}>Login</Button>
      <div>
        {message}
      </div>
    </div>
  );
}
