import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView, RefreshControl } from 'react-native';
import OSMap from '../components/OSMap';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getOrder, getVendor, updateOrder } from '../lib/api';

export default function RiderVanNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const { OrderID } = route.params;
  const [vendor, setVendor] = useState(null);
  const [AcceptedOrder, setAcceptedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const fetchVendorDetails = async () => {
    try {
      const response = { data: await getOrder(OrderID) };
      setAcceptedOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }

   
  };

  useEffect(()=>{
    const fetchOrderDetail = async () => {
      if (AcceptedOrder) {
        try {
          const res = { data: await getVendor(AcceptedOrder.VendorID) };
          setVendor(res.data);
          console.log(res.data);
        } catch (error) {
          console.error('Failed to fetch vendor details:', error);
        }
      }
      
    }

    fetchOrderDetail();
  },[AcceptedOrder])
  const onRefresh = () => {
    setRefreshing(true);
    fetchVendorDetails().finally(() => setRefreshing(false));
  };

  const handleNavigate = () => {
    if (vendor) {
      const url = `http://maps.google.com/?q=${vendor.Latitude},${vendor.Longitude}`;
      Linking.openURL(url);
    }
  };

  const handleArrivedAtVendor = async () => {
    try {
      const response = await updateOrder(OrderID, { OrderStatus: 'AtVendor' });
    if(response){
      console.log(response)
      navigation.navigate('OrderPickUp', { OrderID });
     
    }
   
    } catch (error) {
      console.error(error);
    }
    
  };

  

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {vendor ? (
        <>
          <Text style={styles.vendorName}>{vendor.BusinessName}</Text>
          <Text style={styles.vendorContact}>Contact: {vendor.Contact}</Text>
          <OSMap
            style={styles.map}
            latitude={vendor.Latitude}
            longitude={vendor.Longitude}
            markers={[{ latitude: vendor.Latitude, longitude: vendor.Longitude, title: vendor.BusinessName }]}
          />
          <TouchableOpacity style={styles.button} onPress={handleNavigate}>
            <Text style={styles.buttonText}>Navigate to Vendor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.arrivedButton]} onPress={handleArrivedAtVendor}>
            <Text style={styles.buttonText}>Arrived at Vendor</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Loading vendor details...</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  vendorName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  vendorContact: {
    fontSize: 16,
    marginBottom: 16,
  },
  map: {
    height: 400,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrivedButton: {
    backgroundColor: '#28A745',
  },
});
