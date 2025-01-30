import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Image, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { getTrackDetails } from '../api/spotify';

const MessageDetailModal = ({ visible, message, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(100);
      
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
      onClose();
      // Reset states
      setSelectedTrack(null);
      setShowPlayer(false);
    });
  };

  const handlePlayTrack = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching track details:', message.trackId);
      const trackDetails = await getTrackDetails(message.trackId);
      setSelectedTrack(trackDetails);
      setShowPlayer(true);
    } catch (error) {
      console.error('Error loading track:', error);
      alert('Gagal memuat lagu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!message) return null;

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
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableWithoutFeedback>
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
                <View style={styles.titleContainer}>
                  <View style={styles.decorDot} />
                  <Text style={styles.headerTitle}>Detail Pesan</Text>
                  <View style={styles.decorDot} />
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <Ionicons name="close" size={20} color="#D4AF37" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={true}
                bounces={true}
              >
                <View style={styles.section}>
                  <Text style={styles.label}>Untuk</Text>
                  <Text style={styles.recipient}>{message.recipient}</Text>
                </View>

                <View style={[styles.section, styles.songCard]}>
                  {selectedTrack && showPlayer ? (
                    <View style={styles.playerSection}>
                      <View style={styles.trackInfoHeader}>
                        {selectedTrack.album?.images?.[0]?.url && (
                          <Image
                            source={{ uri: selectedTrack.album.images[0].url }}
                            style={styles.albumArt}
                          />
                        )}
                        <View style={styles.trackTextInfo}>
                          <Text style={styles.trackName}>{selectedTrack.name}</Text>
                          <Text style={styles.artistName}>
                            {selectedTrack.artists?.map(artist => artist.name).join(', ')}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.minimizeButton}
                          onPress={() => setShowPlayer(false)}
                        >
                          <Ionicons name="chevron-down" size={20} color="#8B4513" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.webviewContainer}>
                        <WebView
                          source={{ uri: `https://open.spotify.com/embed/track/${selectedTrack.id}` }}
                          style={styles.webview}
                          allowsInlineMediaPlayback={true}
                          mediaPlaybackRequiresUserAction={false}
                          onNavigationStateChange={(navState) => {
                            // Mencegah navigasi keluar dari embed player
                            if (!navState.url.includes('embed')) {
                              return false;
                            }
                          }}
                          bounces={false}
                          scrollEnabled={false}
                        />
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.songInfo}>
                        <Ionicons name="musical-notes" size={24} color="#D4AF37" style={styles.musicIcon} />
                        <View style={styles.songTextContainer}>
                          <Text style={styles.trackName}>{message.trackName}</Text>
                          <Text style={styles.artistName}>{message.artistName}</Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity
                        style={[
                          styles.playButton,
                          isLoading && styles.playButtonDisabled
                        ]}
                        onPress={handlePlayTrack}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Text style={styles.playButtonText}>Memuat...</Text>
                        ) : (
                          <>
                            <Ionicons name="play" size={16} color="#D4AF37" />
                            <Text style={styles.playButtonText}>Putar Lagu</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Pesan</Text>
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionQuote}>"</Text>
                    <Text style={styles.description}>{message.description}</Text>
                    <Text style={styles.descriptionQuote}>"</Text>
                  </View>
                </View>

                <View style={[styles.section, styles.lastSection]}>
                  <Text style={styles.label}>Waktu</Text>
                  <Text style={styles.timestamp}>
                    {new Date(message.timestamp).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
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
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A0F0F',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '85%',
    width: '100%',
    borderWidth: 1,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#8B4513',
    backgroundColor: '#2C1810',
    zIndex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decorDot: {
    width: 3,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 1.5,
    marginHorizontal: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 0,
  },
  messageInfo: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    color: '#8B4513',
    marginTop: 14,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  recipient: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#D4AF37',
    letterSpacing: 0.3,
  },
  songCard: {
    backgroundColor: '#2C1810',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  musicIcon: {
    marginRight: 10,
  },
  songTextContainer: {
    flex: 1,
  },
  trackName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 13,
    color: '#BF8970',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  descriptionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#2C1810',
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#D4AF37',
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingHorizontal: 10,
    fontStyle: 'italic',
  },
  descriptionQuote: {
    fontSize: 36,
    color: '#D4AF37',
    opacity: 0.6,
    height: 30,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#8B4513',
    fontStyle: 'italic',
  },
  playButton: {
    backgroundColor: '#1A0F0F',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  playButtonDisabled: {
    opacity: 0.6,
    borderColor: '#8B4513',
  },
  playButtonText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  playerSection: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1A0F0F',
  },
  trackInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#2C1810',
    borderBottomWidth: 1,
    borderBottomColor: '#8B4513',
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  trackTextInfo: {
    flex: 1,
  },
  minimizeButton: {
    padding: 4,
  },
  webviewContainer: {
    height: 80,
    backgroundColor: '#2C1810',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  webview: {
    flex: 1,
    backgroundColor: '#2C1810',
  },
});

export default MessageDetailModal; 