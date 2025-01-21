import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import RouterNavigation from './src/Navigator/Router';
// import {createTable, getCredentials} from './src/config/sqliteDB';

export default function App() {
  // const [initialRoute, setInitialRoute] = useState('Login');

  // useEffect(() => {
  //   const initializeApp = async () => {
  //     await createTable(); // Pastikan tabel dibuat
  //     const credentials = await getCredentials();
  //     if (credentials) {
  //       setInitialRoute('MainPage'); // Jika ada akun di SQLite, arahkan ke halaman utama
  //     }
  //   };
  //   initializeApp();
  // }, []);

  return (
    <NavigationContainer>
      <RouterNavigation />
    </NavigationContainer>
  );
}
