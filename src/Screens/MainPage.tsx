import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Animated,
  useWindowDimensions,
} from 'react-native';
import {firestore} from '../config/FIREBASE';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {clearCredentials} from '../config/sqliteDB';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

interface Note {
  id: string;
  title: string;
  content: string;
}

const NotesApp: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;
  const navigation = useNavigation();

  const animations = new Map<string, Animated.Value>(); // Store animations for each note

  const fetchNotes = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'notes'));
      const fetchedNotes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const saveNote = async () => {
    if (title.trim() && content.trim()) {
      try {
        if (editingId) {
          // Edit note
          const noteRef = doc(firestore, 'notes', editingId);
          await updateDoc(noteRef, {title, content});

          // Update local notes
          setNotes(prevNotes =>
            prevNotes.map(note =>
              note.id === editingId ? {...note, title, content} : note,
            ),
          );

          setEditingId(null);
        } else {
          // Add new note
          const newNote = {title, content};
          const docRef = await addDoc(collection(firestore, 'notes'), newNote);
          const newId = docRef.id;

          // Initialize animation for new item
          const animatedValue = new Animated.Value(-width);
          animations.set(newId, animatedValue);

          setNotes(prevNotes => [
            {id: newId, title: newNote.title, content: newNote.content},
            ...prevNotes,
          ]);

          // Trigger slide-in animation
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }

        // Reset form
        setTitle('');
        setContent('');
      } catch (error) {
        console.error('Error saving note:', error);
      }
    } else {
      Alert.alert('Error', 'Title or content cannot be empty');
    }
  };

  const deleteNote = async (id: string) => {
    const animatedValue = animations.get(id);
    if (!animatedValue) return;

    Alert.alert(
      'Hapus Catatan',
      'Apakah Anda yakin ingin menghapus catatan ini?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              Animated.timing(animatedValue, {
                toValue: -width,
                duration: 500,
                useNativeDriver: true,
              }).start(() => {
                const noteRef = doc(firestore, 'notes', id);
                deleteDoc(noteRef).then(fetchNotes);
              });
            } catch (error) {
              console.error('Error deleting note:', error);
            }
          },
        },
      ],
    );
  };

  const renderNote = ({item}: {item: Note}) => {
    if (!animations.has(item.id)) {
      animations.set(item.id, new Animated.Value(0)); // Initialize animation value for existing notes
    }

    const animatedValue = animations.get(item.id);

    return (
      <Animated.View
        style={[
          styles.noteCard,
          {transform: [{translateX: animatedValue || 0}]},
        ]}>
        <View style={styles.noteContent}>
          <Text style={styles.noteTitle}>{item.title}</Text>
          <Text style={styles.noteText}>{item.content}</Text>
        </View>
        <View style={styles.noteActions}>
          <TouchableOpacity
            onPress={() => prepareEditNote(item)}
            style={styles.editButton}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deleteNote(item.id)}
            style={styles.deleteButton}>
            <Text style={styles.actionText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const prepareEditNote = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              await clearCredentials();
              await auth().signOut();
              navigation.replace('LoginPage');
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <View
      style={[
        styles.container,
        isLandscape && {flexDirection: 'row', paddingHorizontal: 32},
      ]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catatan Saya</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.inputContainer,
          isLandscape && {flex: 1, marginRight: 16},
        ]}>
        <TextInput
          style={styles.input}
          placeholder="Judul"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Konten"
          value={content}
          onChangeText={setContent}
          multiline
        />
        <TouchableOpacity style={styles.addButton} onPress={saveNote}>
          <Text style={styles.addButtonText}>
            {editingId ? 'Perbarui Catatan' : 'Tambah Catatan'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={renderNote}
        contentContainerStyle={isLandscape && {flex: 1}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#00897b',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff5252',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
  },
  addButton: {
    backgroundColor: '#00897b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteCard: {
    backgroundColor: 'white',
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  noteContent: {
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 14,
    color: '#555',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    padding: 8,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NotesApp;
