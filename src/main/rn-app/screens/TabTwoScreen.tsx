import {Button} from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from "../types";
import styles from './styles';

export default function TabTwoScreen({ navigation, route }: RootTabScreenProps<'TabTwo'>) {
  console.log(route);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab Two</Text>
      <Button title={"Open screen"} onPress={() => navigation.navigate("NotFound")} />
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="/screens/TabTwoScreen.tsx" />
    </View>
  );
}
