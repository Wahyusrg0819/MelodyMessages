import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TabButton = ({ label, isFocused, onPress, iconName }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(isFocused ? 1 : 0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.02 : 1,
        useNativeDriver: true,
        damping: 12,
        mass: 0.8,
        stiffness: 100
      }),
      Animated.timing(fadeAnim, {
        toValue: isFocused ? 1 : 0.8,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.touchable}
    >
      <Animated.View
        style={[
          styles.tabButton,
          isFocused && styles.tabButtonFocused,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.tabContent}>
          <Ionicons 
            name={iconName} 
            size={22} 
            color={isFocused ? '#D4AF37' : '#8B4513'} 
            style={styles.tabIcon}
          />
          <Text style={[
            styles.tabText,
            isFocused && styles.tabTextFocused
          ]}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName;
          if (route.name === 'Kirim Pesan') {
            iconName = isFocused ? 'musical-notes' : 'musical-notes-outline';
          } else if (route.name === 'Feed') {
            iconName = isFocused ? 'list' : 'list-outline';
          } else if (route.name === 'Cari') {
            iconName = isFocused ? 'search' : 'search-outline';
          }

          return (
            <TabButton
              key={route.key}
              label={label}
              isFocused={isFocused}
              onPress={onPress}
              iconName={iconName}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A0F0F',
    borderTopWidth: 1,
    borderColor: '#8B4513',
    paddingBottom: 10,
    paddingTop: 8,
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  touchable: {
    flex: 1,
    maxWidth: 90,
    marginHorizontal: 6,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#2C1810',
    borderWidth: 1,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 3,
  },
  tabButtonFocused: {
    backgroundColor: '#2C1810',
    borderColor: '#D4AF37',
    borderWidth: 1.5,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 10,
    color: '#8B4513',
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  tabTextFocused: {
    color: '#D4AF37',
    fontWeight: '800',
    textShadowColor: 'rgba(212, 175, 55, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.5,
  }
});

export default CustomTabBar; 