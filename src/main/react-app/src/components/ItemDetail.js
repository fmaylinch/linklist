import { useState } from 'react';
import { useHistory } from "react-router-dom";
import styled from '@emotion/styled'
import {Container, TextField} from '@material-ui/core';
import {Alert} from '@material-ui/lab';

export default function ItemDetail({item}) {

  const [title, setTitle] = useState(item.title);

  const history = useHistory();
  if (item.dummy) {
    // Go to home page if item was not passed
    history.replace("/");
    return "";
  }

  return (
    <Container maxWidth="sm">
      <div>
        <TextField label="title" fullWidth
          value={title} onChange={e => setTitle(e.target.value)} />
      </div>
    </Container>
  );
}
