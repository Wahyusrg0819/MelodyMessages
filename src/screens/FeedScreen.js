import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { subscribeToMessages } from '../utils/messageHelper';
import { getTrackDetails } from '../api/spotify';
import MessageDetailModal from '../components/MessageDetailModal';
import CustomHeader from '../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { createFadeInAnimation, createPlayButtonAnimation } from '../utils/animationHelper';

const FeedScreen = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isMessageDetailVisible, setIsMessageDetailVisible] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [loadingTrack, setLoadingTrack] = useState(null);

  // Refs untuk animasi
  const fadeAnims = useRef({});
  const playButtonScaleAnims = useRef({});
  const playButtonOpacityAnims = useRef({});

  useEffect(() => {
    const unsubscribe = subscribeToMessages((updatedMessages) => {
      setMessages(updatedMessages);
      // Inisialisasi animasi untuk pesan baru
      updatedMessages.forEach((message) => {
        if (!fadeAnims.current[message.id]) {
          fadeAnims.current[message.id] = new Animated.Value(0);
          playButtonScaleAnims.current[message.id] = new Animated.Value(1);
          playButtonOpacityAnims.current[message.id] = new Animated.Value(1);
        }
      });
      // Jalankan animasi fade in
      animateMessages(updatedMessages);
    });

    return () => unsubscribe();
  }, []);

  const animateMessages = (messages) => {
    messages.forEach((message) => {
      createFadeInAnimation(fadeAnims.current[message.id]).start();
    });
  };

  const handlePlayTrack = async (message) => {
    try {
      setLoadingTrack(message.id);
      createPlayButtonAnimation(
        playButtonScaleAnims.current[message.id],
        playButtonOpacityAnims.current[message.id]
      ).start();
      
      const trackDetails = await getTrackDetails(message.trackId);
      setExpandedMessage({
        ...message,
        trackDetails
      });
    } catch (error) {
      console.error('Error getting track details:', error);
      alert('Gagal memuat lagu');
    } finally {
      setLoadingTrack(null);
    }
  };

  const handleMessagePress = (message) => {
    setSelectedMessage(message);
    setIsMessageDetailVisible(true);
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedMessage?.id === item.id;
    const isLoading = loadingTrack === item.id;

    const renderPlayButton = () => (
      <Animated.View
        style={{
          transform: [{ scale: playButtonScaleAnims.current[item.id] }],
          opacity: playButtonOpacityAnims.current[item.id],
        }}
      >
        <TouchableOpacity
          style={[
            styles.playButton,
            isLoading && styles.playButtonDisabled
          ]}
          onPress={() => handlePlayTrack(item)}
          disabled={isLoading}
          activeOpacity={0.7}
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
      </Animated.View>
    );

    return (
      <Animated.View
        style={[
          styles.messageCard,
          isExpanded && styles.messageCardExpanded,
          {
            opacity: fadeAnims.current[item.id]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.messageContent}
          onPress={() => !isExpanded && handleMessagePress(item)}
          activeOpacity={0.9}
        >
          <Text style={styles.recipient}>Untuk: {item.recipient}</Text>
          
          {!isExpanded && (
            <>
              <View style={styles.songInfo}>
                <Ionicons name="musical-notes" size={20} color="#8B4513" style={styles.musicIcon} />
                <View style={styles.songTextContainer}>
                  <Text style={styles.trackName}>{item.trackName}</Text>
                  <Text style={styles.artistName}>{item.artistName}</Text>
                </View>
              </View>
              
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
              
              {renderPlayButton()}
            </>
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.playerSection}>
            <View style={styles.trackInfoHeader}>
              {expandedMessage.trackDetails.album?.images?.[0]?.url && (
                <Image
                  source={{ uri: expandedMessage.trackDetails.album.images[0].url }}
                  style={styles.albumArt}
                />
              )}
              <View style={styles.trackTextInfo}>
                <Text style={styles.trackName}>{item.trackName}</Text>
                <Text style={styles.artistName}>{item.artistName}</Text>
              </View>
              <TouchableOpacity 
                style={styles.minimizeButton}
                onPress={() => setExpandedMessage(null)}
              >
                <Ionicons name="chevron-up" size={20} color="#8B4513" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.webviewContainer}>
              <WebView
                source={{ uri: `https://open.spotify.com/embed/track/${item.trackId}` }}
                style={styles.webview}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                onNavigationStateChange={(navState) => {
                  if (!navState.url.includes('embed')) {
                    return false;
                  }
                }}
                bounces={false}
                scrollEnabled={false}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => handleMessagePress(item)}
            >
              <Text style={styles.viewDetailsText}>Lihat Detail Pesan</Text>
              <Ionicons name="chevron-forward" size={16} color="#8B4513" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Feed Global" />
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <MessageDetailModal
        visible={isMessageDetailVisible}
        message={selectedMessage}
        onClose={() => {
          setIsMessageDetailVisible(false);
          setSelectedMessage(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0F0F',
  },
  listContainer: {
    padding: 12,
  },
  messageCard: {
    backgroundColor: '#2C1810',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  messageCardExpanded: {
    paddingBottom: 6,
  },
  recipient: {
    fontSize: 11,
    color: '#BF8970',
    marginBottom: 4,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  musicIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  songTextContainer: {
    flex: 1,
  },
  trackName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  artistName: {
    fontSize: 11,
    color: '#BF8970',
    marginBottom: 2,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
    color: '#D4AF37',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  playButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#D4AF37',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  playButtonText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  playerSection: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1A0F0F',
    marginTop: 6,
  },
  trackInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#2C1810',
    borderBottomWidth: 1,
    borderBottomColor: '#8B4513',
  },
  albumArt: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginRight: 8,
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
    height: 70,
    backgroundColor: '#2C1810',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#8B4513',
    marginTop: 6,
  },
  webview: {
    flex: 1,
    backgroundColor: '#2C1810',
  },
  messageContent: {
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#8B4513',
  },
  viewDetailsText: {
    color: '#8B4513',
    fontSize: 11,
    fontStyle: 'italic',
    marginRight: 4,
  },
});

export default FeedScreen; 