import { combineReducers, configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import CartSlice from './slices/CartSlices';
import ShopSlice from './slices/ShopSlices';
import AuthSlice from './slices/AuthSlice';

const rootReducer = combineReducers({
  cart: CartSlice,
  Shop: ShopSlice,
  auth: AuthSlice,
});

// Only the cart and the signed-in profile survive a restart (Shop is transient screen state).
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['cart', 'auth'],
};

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);
