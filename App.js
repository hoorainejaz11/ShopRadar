import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { store, persistor } from './store';
import { selectUser, setUser } from './slices/AuthSlice';
import DrawerNav from './Drawer';
import Login from './AuthScreens/Login';
import SignUp from './AuthScreens/SignUp';
import { supabase } from './lib/supabase';
import { hydrateCache } from './lib/cache';
import { clearLocalSession, refreshStoredUser } from './lib/api';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

const Splash = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
    <ActivityIndicator size="large" color="#3498db" />
  </View>
);

// Runs once after Redux has rehydrated: restores the session, then picks the first route.
function Root() {
  const user = useSelector(selectUser);
  const [initialRoute, setInitialRoute] = useState(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    (async () => {
      await hydrateCache();
      let route = 'Login';
      try {
        // Reads the locally stored session (no network); supabase refreshes the token itself.
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          let profile = store.getState().auth.user;
          if (!profile) {
            // Migrate users who signed in before Redux persistence existed.
            const legacy = await AsyncStorage.getItem('user');
            if (legacy) {
              profile = JSON.parse(legacy);
              store.dispatch(setUser(profile));
            }
          }
          if (profile) {
            await AsyncStorage.setItem('user', JSON.stringify(profile)); // screens still read this key
            route = 'DrawerNav';
            // Refresh the profile in the background; never blocks startup.
            refreshStoredUser().then(
              (c) => c || handleSignedOut(),
              () => {} // offline: keep the cached profile
            );
          } else {
            try {
              if (await refreshStoredUser()) route = 'DrawerNav';
            } catch (_) {}
          }
        } else {
          await AsyncStorage.removeItem('user');
          store.dispatch({ type: 'auth/clearUser' });
        }
      } catch (e) {
        console.log('Session restore failed:', e);
      }
      setInitialRoute(route);
    })();
  }, []);

  // Session ended (explicit logout, expired/revoked refresh token) -> clear state and go to Login.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') handleSignedOut();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Keep the token fresh only while the app is in the foreground.
  useEffect(() => {
    supabase.auth.startAutoRefresh();
    const s = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => {
      s.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  if (!initialRoute) return <Splash />;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="DrawerNav" component={DrawerNav} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

async function handleSignedOut() {
  await clearLocalSession();
  if (navigationRef.isReady()) {
    const current = navigationRef.getCurrentRoute()?.name;
    if (current !== 'Login' && current !== 'SignUp') navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Splash />} persistor={persistor}>
        <Root />
      </PersistGate>
    </Provider>
  );
}
