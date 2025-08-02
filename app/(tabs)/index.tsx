import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../Login';
import SignUpScreen from '../SignUp';
import HomeScreen from '../HomeScreen'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
  );
}
