import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SongSearchScreen from '../screens/SongSearchScreen';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Kirim Pesan" 
        component={SongSearchScreen}
      />
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
      />
      <Tab.Screen 
        name="Cari" 
        component={SearchScreen}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator; 