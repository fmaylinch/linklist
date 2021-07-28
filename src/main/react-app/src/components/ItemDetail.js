import { useHistory } from "react-router-dom";
import styled from '@emotion/styled'

const padding = 10;

const Item = styled.div`
  padding: ${padding}px;
`;

export default function ItemDetail({item}) {
  const history = useHistory();
  if (!item) {
    // Go to home page if item was not passed
    history.replace("/");
    return "";
  }
  return <Item>Item {item.id}</Item>;
}
