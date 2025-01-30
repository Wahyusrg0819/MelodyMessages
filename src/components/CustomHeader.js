import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomHeader = ({ title }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.statusBarBg}>
        <StatusBar 
          backgroundColor="#BCCCDC" 
          barStyle="light-content"
          translucent={false}
        />
      </View>
      <View style={styles.header}>
        <View style={styles.innerHeader}>
          <View style={styles.decorContainer}>
            <Ionicons name="musical-notes" size={20} color="#D4AF37" />
          </View>
          <View style={styles.titleContainer}>
            <View style={styles.decorDot} />
            <Text style={styles.title}>{title}</Text>
            <View style={styles.decorDot} />
          </View>
          <View style={[styles.decorContainer, styles.decorContainerRight]}>
            <Ionicons name="musical-notes" size={20} color="#D4AF37" />
          </View>
        </View>
        <View style={styles.bottomDecor}>
          <View style={styles.decorDot} />
          <View style={styles.decorDot} />
          <View style={styles.decorDot} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#1A0F0F',
  },
  statusBarBg: {
    backgroundColor: '#1A0F0F',
    height: StatusBar.currentHeight,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
  },
  header: {
    backgroundColor: '#1A0F0F',
  },
  innerHeader: {
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#8B4513',
    paddingHorizontal: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  decorContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    left: 16,
  },
  decorContainerRight: {
    left: undefined,
    right: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginHorizontal: 12,
  },
  decorDot: {
    width: 5,
    height: 5,
    backgroundColor: '#D4AF37',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#8B4513',
    marginHorizontal: 8,
  },
  bottomDecor: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#8B4513',
    gap: 15,
  },
});

export default CustomHeader; 