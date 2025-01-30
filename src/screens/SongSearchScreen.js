import React, { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Modal, Animated } from 'react-native';
import { searchTracks } from '../api/spotify';
import { sendMessage } from '../utils/messageHelper';
import CustomHeader from '../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <Ionicons name="search" size={20} color="#8B4513" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari lagu..."
          placeholderTextColor="#8B4513"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          enablesReturnKeyAutomatically={true}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#8B4513" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const TrackItem = ({ track, onSelect, isSelected }) => (
  <TouchableOpacity
    style={[styles.trackItem, isSelected && styles.trackItemSelected]}
    onPress={() => onSelect(track)}
    activeOpacity={0.7}
  >
    <View style={styles.trackContent}>
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
        <Text style={styles.artistName} numberOfLines={1}>{track.artists[0].name}</Text>
      </View>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const MessageForm = ({ selectedTrack, onSubmit, onCancel }) => {
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!recipient.trim() || !description.trim()) {
      alert('Mohon lengkapi semua field');
      return;
    }
    onSubmit({ recipient, description });
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.selectedTrack}>
        <Text style={styles.selectedTrackLabel}>Lagu Terpilih:</Text>
        <Text style={styles.selectedTrackText}>
          {selectedTrack.name} - {selectedTrack.artists[0].name}
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Untuk siapa?"
        placeholderTextColor="#8B4513"
        value={recipient}
        onChangeText={setRecipient}
      />
      
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Tulis pesanmu..."
        placeholderTextColor="#8B4513"
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Batal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Kirim Pesan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SuccessModal = ({ visible, onClose }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.3));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={50} color="#D4AF37" />
          </View>
          <Text style={styles.modalTitle}>Berhasil!</Text>
          <Text style={styles.modalMessage}>Pesan musik kamu sudah terkirim</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.modalButtonText}>Kembali</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const SongSearchScreen = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSearch = async (query) => {
    setIsLoading(true);
    try {
      const results = await searchTracks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tracks:', error);
      alert('Gagal mencari lagu');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async ({ recipient, description }) => {
    try {
      await sendMessage({
        trackId: selectedTrack.id,
        trackName: selectedTrack.name,
        artistName: selectedTrack.artists[0].name,
        recipient,
        description,
        timestamp: new Date(),
      });
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Gagal mengirim pesan');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSelectedTrack(null);
    setSearchResults([]);
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Kirim Pesan Musik" />
      
      {!selectedTrack ? (
        <>
          <SearchBar onSearch={handleSearch} />
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D4AF37" />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={({ item }) => (
                <TrackItem
                  track={item}
                  onSelect={setSelectedTrack}
                  isSelected={selectedTrack?.id === item.id}
                />
              )}
              keyExtractor={item => item.id}
              style={styles.resultsList}
              contentContainerStyle={styles.resultsContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        <MessageForm
          selectedTrack={selectedTrack}
          onSubmit={handleSubmit}
          onCancel={() => setSelectedTrack(null)}
        />
      )}

      <SuccessModal 
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
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
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#8B4513',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C1810',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B4513',
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#D4AF37',
    fontSize: 14,
    height: '100%',
    letterSpacing: 0.3,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    padding: 12,
  },
  trackItem: {
    backgroundColor: '#2C1810',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B4513',
    marginBottom: 8,
    overflow: 'hidden',
  },
  trackItemSelected: {
    borderColor: '#D4AF37',
    borderWidth: 1.5,
  },
  trackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  trackInfo: {
    flex: 1,
    marginRight: 8,
  },
  trackName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  artistName: {
    fontSize: 11,
    color: '#BF8970',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  selectedIndicator: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 12,
  },
  selectedTrack: {
    backgroundColor: '#2C1810',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  selectedTrackLabel: {
    fontSize: 11,
    color: '#BF8970',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  selectedTrackText: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#2C1810',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B4513',
    padding: 10,
    marginBottom: 12,
    color: '#D4AF37',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginLeft: 6,
  },
  submitButtonText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2C1810',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B4513',
    marginRight: 6,
  },
  cancelButtonText: {
    color: '#8B4513',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 15, 15, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2C1810',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  successIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(26, 15, 15, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  modalMessage: {
    fontSize: 16,
    color: '#BF8970',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default SongSearchScreen; 