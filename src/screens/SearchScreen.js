import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text, TouchableOpacity, Animated, Platform, Image } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import CustomHeader from '../components/CustomHeader';
import MessageDetailModal from '../components/MessageDetailModal';
import { getTrackDetails } from '../api/spotify';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { createFadeInAnimation, createPlayButtonAnimation } from '../utils/animationHelper';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isMessageDetailVisible, setIsMessageDetailVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [loadingTrack, setLoadingTrack] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Refs untuk animasi dan debouncing
  const fadeAnims = useRef({});
  const playButtonScaleAnims = useRef({});
  const playButtonOpacityAnims = useRef({});
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    createFadeInAnimation(searchBarAnim).start();
  }, []);

  const validateSearch = (query) => {
    // Reset error state
    setSearchError('');

    // Case 1: Query kosong
    if (!query.trim()) {
      setSearchResults([]);
      return false;
    }

    // Case 2: Query terlalu pendek
    if (query.trim().length < 2) {
      setSearchError('Minimal 2 karakter untuk mencari');
      return false;
    }

    // Case 3: Query terlalu panjang
    if (query.trim().length > 50) {
      setSearchError('Maksimal 50 karakter');
      return false;
    }

    // Case 4: Query hanya berisi spasi
    if (!query.trim().replace(/\s/g, '').length) {
      setSearchError('Masukkan kata kunci yang valid');
      return false;
    }

    return true;
  };

  const handleQueryChange = (text) => {
    setSearchQuery(text);
    setSearchError('');

    // Clear timeout sebelumnya
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Auto search setelah 500ms user berhenti mengetik
    if (text.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(text);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearch = async (searchText = searchQuery) => {
    if (!validateSearch(searchText)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setExpandedMessage(null);

    try {
      const messagesRef = collection(db, 'messages');
      const trimmedQuery = searchText.trim().toLowerCase();
      
      // Mencari berdasarkan recipient
      const recipientQueryRef = query(
        messagesRef,
        where('recipient', '>=', trimmedQuery),
        where('recipient', '<=', trimmedQuery + '\uf8ff')
      );

      // Mencari berdasarkan description
      const descriptionQueryRef = query(
        messagesRef,
        where('description', '>=', trimmedQuery),
        where('description', '<=', trimmedQuery + '\uf8ff')
      );

      const [recipientSnapshot, descriptionSnapshot] = await Promise.all([
        getDocs(recipientQueryRef),
        getDocs(descriptionQueryRef)
      ]);

      // Menggabungkan hasil dan menghilangkan duplikat
      const messages = new Map();
      
      recipientSnapshot.forEach((doc) => {
        messages.set(doc.id, { id: doc.id, ...doc.data() });
      });

      descriptionSnapshot.forEach((doc) => {
        messages.set(doc.id, { id: doc.id, ...doc.data() });
      });

      const uniqueMessages = Array.from(messages.values());
      
      if (uniqueMessages.length === 0) {
        // Jika tidak ada hasil, coba cari dengan exact match
        const exactMatchQuery = query(
          messagesRef,
          where('recipient', '==', trimmedQuery)
        );
        
        const exactMatchSnapshot = await getDocs(exactMatchQuery);
        exactMatchSnapshot.forEach((doc) => {
          messages.set(doc.id, { id: doc.id, ...doc.data() });
        });
      }

      const finalResults = Array.from(messages.values());
      
      initializeAnimations(finalResults);
      setSearchResults(finalResults);
      animateResults(finalResults);

    } catch (error) {
      console.error('Search error:', error);
      setError('Gagal melakukan pencarian. Silakan coba lagi.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAnimations = (results) => {
    results.forEach((result) => {
      if (!fadeAnims.current[result.id]) {
        fadeAnims.current[result.id] = new Animated.Value(0);
        playButtonScaleAnims.current[result.id] = new Animated.Value(1);
        playButtonOpacityAnims.current[result.id] = new Animated.Value(1);
      }
    });
  };

  const animateResults = (results) => {
    results.forEach((result) => {
      createFadeInAnimation(fadeAnims.current[result.id]).start();
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
      console.error('Error loading track:', error);
      alert('Gagal memuat lagu: ' + error.message);
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
          styles.messageCardContainer,
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
                  // Mencegah event bubble
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
      <CustomHeader title="Cari Pesan" />
      <Animated.View 
        style={[
          styles.searchContainer,
          { opacity: searchBarAnim }
        ]}
      >
        <View style={[
          styles.searchInputWrapper,
          searchError ? styles.searchInputError : null
        ]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={searchError ? '#FF6B6B' : '#8B4513'} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari berdasarkan nama penerima atau isi pesan..."
            value={searchQuery}
            onChangeText={handleQueryChange}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            placeholderTextColor="#8B4513"
            editable={!isLoading}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setExpandedMessage(null);
                setSearchError('');
              }}
              style={styles.clearButton}
              disabled={isLoading}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={searchError ? '#FF6B6B' : '#8B4513'} 
              />
            </TouchableOpacity>
          )}
        </View>
        {searchError ? (
          <Text style={styles.errorText}>{searchError}</Text>
        ) : (
          <Text style={styles.hintText}>
            {searchQuery.length === 0 ? 'Cari berdasarkan nama penerima atau isi pesan' : 
             searchQuery.length === 1 ? 'Ketik minimal 2 karakter...' : ''}
          </Text>
        )}
      </Animated.View>

      {isLoading && (
        <Animated.View 
          style={[
            styles.loadingContainer,
            { opacity: searchBarAnim }
          ]}
        >
          <Text style={styles.loadingText}>Mencari pesan...</Text>
        </Animated.View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {!isLoading && searchResults.length === 0 && searchQuery.trim() !== '' && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>Tidak ada pesan ditemukan</Text>
        </View>
      )}

      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.resultsList}
        contentContainerStyle={styles.resultsContent}
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#8B4513',
    backgroundColor: '#1A0F0F',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C1810',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#8B4513',
    paddingHorizontal: 12,
    height: 48,
  },
  searchInputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#D4AF37',
    paddingVertical: 12,
    letterSpacing: 0.3,
  },
  clearButton: {
    padding: 4,
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  messageCardContainer: {
    backgroundColor: '#2C1810',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    borderWidth: 1.5,
    borderColor: '#8B4513',
  },
  messageCardExpanded: {
    paddingBottom: 8,
  },
  messageContent: {
    flex: 1,
  },
  recipient: {
    fontSize: 12,
    color: '#BF8970',
    marginBottom: 6,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  artistName: {
    fontSize: 13,
    color: '#BF8970',
    marginBottom: 4,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    color: '#D4AF37',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  playButton: {
    backgroundColor: '#8B4513',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  playButtonText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FF000020',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#8B4513',
    fontSize: 14,
  },
  playerSection: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1A0F0F',
    marginTop: 8,
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
    marginTop: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: '#2C1810',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#8B4513',
  },
  viewDetailsText: {
    color: '#8B4513',
    fontSize: 12,
    fontStyle: 'italic',
    marginRight: 4,
  },
  hintText: {
    color: '#8B4513',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

export default SearchScreen; 