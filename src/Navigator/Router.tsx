import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginPage from '../Screens/LoginPage';
import SignupPage from '../Screens/SignupPage';
import NotesApp from '../Screens/MainPage';
import {createTable, getCredentials} from '../config/sqliteDB';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        await createTable(); // Membuat tabel jika belum ada
        console.log("Table 'user_credentials' created or already exists.");

        const credentials = await getCredentials(); // Ambil data login dari SQLite
        if (credentials) {
          console.log('Auto-login credentials found:', credentials);
          setInitialRoute('MainPage'); // Jika ada kredensial, arahkan ke halaman utama
        } else {
          console.log('No credentials found. Redirecting to LoginPage.');
          setInitialRoute('LoginPage'); // Jika tidak ada kredensial, arahkan ke LoginPage
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        setInitialRoute('LoginPage'); // Jika terjadi error, tetap arahkan ke LoginPage
      }
    };

    initializeApp();
  }, []);

  if (initialRoute === null) {
    // Tampilkan layar kosong (splash/loading) saat masih memproses
    return null;
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="MainPage"
        component={NotesApp}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="LoginPage"
        component={LoginPage}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SignupPage"
        component={SignupPage}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default StackNavigation;
