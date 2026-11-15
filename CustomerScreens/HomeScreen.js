import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, View, ScrollView, Text, StyleSheet, TouchableOpacity, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import * as Icon from 'react-native-feather';
import { useSelector } from 'react-redux';
import { themeColors } from '../theme';
import Categories from '../CustomerComponent/categories';
import FeaturedRow from '../CustomerComponent/featuredRow';
import { getCustomerActiveOrders, getVendors, TTL } from '../lib/api';
import { useQuery } from '../lib/useQuery';
import { selectUser } from '../slices/AuthSlice';
import PendingOrders from '../CustomerComponent/PendingOrderIcon';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import { categories,markets } from "../constants";

const EMPTY = [];
const categoryNames = categories.map(category => category.name);
const MarketNames = markets.map(MARKET => MARKET.name);

export default function HomeScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  // Draft values edited in the modal vs. the filters actually applied to the list.
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [applied, setApplied] = useState({ market: '', category: '' });
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const customerId = user?.CustomerID;

  // Vendors: cached (also persisted across restarts); shown instantly, refreshed in the background when stale.
  const vendorsQ = useQuery('vendors', (force) => getVendors({ force }), { ttl: TTL.vendors });
  // Active orders are live data: short TTL so the badge stays current without a request per render.
  const ordersQ = useQuery(
    customerId ? `orders:active:${customerId}` : null,
    (force) => getCustomerActiveOrders(customerId, { force }),
    { ttl: 15000, enabled: !!customerId }
  );
  const vendors = vendorsQ.data || EMPTY;
  const pendingOrdersCount = ordersQ.data?.length || 0;

  // Re-validate whenever Home regains focus (e.g. after placing an order) instead of only on first mount.
  const { revalidate: revalidateVendors } = vendorsQ;
  const { revalidate: revalidateOrders } = ordersQ;
  useFocusEffect(
    useCallback(() => {
      revalidateVendors();
      revalidateOrders();
    }, [revalidateVendors, revalidateOrders])
  );

  const refreshing = vendorsQ.refreshing || ordersQ.refreshing;
  const onRefresh = useCallback(() => {
    vendorsQ.refresh();
    if (customerId) ordersQ.refresh();
  }, [vendorsQ.refresh, ordersQ.refresh, customerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = () => {
    setApplied({ market: selectedMarket, category: selectedCategory });
    setModalVisible(false);
  };

  const clearFilters = () => {
    setSelectedMarket('');
    setSelectedCategory('');
    setApplied({ market: '', category: '' });
    setModalVisible(false);
  };

  // Derived (never overwrites the source list, so filters can be changed/cleared repeatedly).
  const groupedVendors = useMemo(() => {
    const acc = {};
    vendors.forEach((vendor) => {
      if (applied.market && vendor.Market !== applied.market) return;
      if (applied.category && vendor.ShopCategory !== applied.category) return;
      (acc[vendor.ShopCategory] = acc[vendor.ShopCategory] || []).push(vendor);
    });
    return acc;
  }, [vendors, applied]);

  const initialLoading = vendorsQ.loading && !vendorsQ.data;
  const failedWithoutData = !!vendorsQ.error && !vendorsQ.data;

  return (
    <SafeAreaView style={{ backgroundColor: 'white' ,flex: 1 }}>
       <StatusBar
        barStyle="dark-content" // Change to 'light-content' if you want light text
        backgroundColor={themeColors.bgColor(1)} // Set the background color if needed
      />
      
      <View style={stylehome.container}>
        <TouchableOpacity style={stylehome.style1} onPress={() => navigation.navigate('SearchScreen')}>
          <View style={{ flexDirection: 'row', flex: 1, }}>
            <Icon.Search height="24" width="24" stroke="grey" />
            <Text style={{ marginLeft: 8, flex: 1, textAlignVertical: 'center', color: 'gray' }}>Search</Text>
            <View style={stylehome.style2}>
              <Icon.MapPin height="20" width="20" stroke="gray" />
              <Text style={{ color: '#718096' }}>
                {applied.market && applied.market.length > 8 
                  ? `${applied.market.substring(0, 8)}...` 
               : applied.market || 'All Lahore'}
               </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={{ backgroundColor: themeColors.bgColor(1), padding: 12, borderRadius: 9999, marginLeft: 5 }}>
            <Icon.Sliders height="20" width="20" strokeWidth={2.5} stroke="white" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Adjusted paddingBottom to ensure space for the fixed element
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <Categories />
        {initialLoading && <ActivityIndicator style={{ marginTop: 40 }} size="large" color={themeColors.bgColor(1)} />}
        {failedWithoutData && (
          <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 24 }}>
            <Text style={{ color: '#718096', textAlign: 'center' }}>Couldn't load shops. Check your connection.</Text>
            <TouchableOpacity onPress={vendorsQ.refetch} style={{ marginTop: 12 }}>
              <Text style={{ color: themeColors.text, fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          {Object.keys(groupedVendors).map((category) => (
            <FeaturedRow
              key={category}
              title={category}
              restaurants={groupedVendors[category]}
              description={`Discover the best ${category} places`}
            />
          ))}
        </View>
      </ScrollView>

     

      {/* Filter Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filters</Text>

            <Text style={styles.label}>Market</Text>
            <RNPickerSelect
              onValueChange={(value) => setSelectedMarket(value)}
              items={MarketNames.map((market) => ({ label: market, value: market }))}
              value={selectedMarket}
              style={pickerSelectStyles}
            />

            <Text style={styles.label}>Category</Text>
            <RNPickerSelect
              onValueChange={(value) => setSelectedCategory(value)}
              items={categoryNames.map((category) => ({ label: category, value: category }))}
              value={selectedCategory}
              style={pickerSelectStyles}
            />

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.button} onPress={applyFilters}>
                <Text style={styles.buttonText}>Apply Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearFilters}>
                <Text style={[styles.buttonText, { color: 'red' }]}>Clear Filters</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
       {/* Pending Orders fixed at the bottom */}
       {pendingOrdersCount > 0 && (
        
          <PendingOrders pendingOrdersCount={pendingOrdersCount} />
       
      )}
     
    </SafeAreaView>
  );
}

const stylehome = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 5,
    paddingBottom: 8,
    marginRight: 5,
    marginTop: 10
  },
  style1: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  style2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#D1D5DB',
  },
});

const styles = StyleSheet.create({
  pendingOrdersContainer: {
    position: 'absolute',

    bottom: 0, // Adjust this value as needed
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderColor: 'red',
    borderWidth: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    textAlign: 'center',
    color: '#007BFF',
    fontSize: 16,
    marginTop: 20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 20,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 20,
  },
});