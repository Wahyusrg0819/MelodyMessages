import React, { useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const PlayerModal = ({ visible, track, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Fade out backdrop
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // Slide out content
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    // Trigger animations first
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Call onClose after animations complete
      onClose();
    });
  };

  if (!track) return null;

  const embedUrl = `https://open.spotify.com/embed/track/${track.id}`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          { opacity: fadeAnim }
        ]}
      >
        {/* Backdrop touchable area */}
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        {/* Modal content */}
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ 
                translateY: slideAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, 800]
                })
              }]
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.trackInfo}>
              {track.album?.images?.[0]?.url && (
                <Image
                  source={{ uri: track.album.images[0].url }}
                  style={styles.albumArt}
                />
              )}
              <View style={styles.textInfo}>
                <Text style={styles.trackName}>{track.name}</Text>
                <Text style={styles.artistName}>
                  {track.artists?.map(artist => artist.name).join(', ')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#8B4513" />
            </TouchableOpacity>
          </View>

          <View style={styles.playerContainer}>
            <WebView
              source={{ uri: embedUrl }}
              style={styles.webview}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#1A0F0F',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '90%',
    borderWidth: 1,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#8B4513',
    backgroundColor: '#2C1810',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 36,
  },
  albumArt: {
    width: 42,
    height: 42,
    borderRadius: 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  textInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  artistName: {
    fontSize: 12,
    color: '#BF8970',
    fontStyle: 'italic',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#2C1810',
    borderRadius: 8,
    margin: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#8B4513',
    minHeight: 300,
  },
  webview: {
    flex: 1,
    backgroundColor: '#2C1810',
  },
});

export default PlayerModal; 