import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SelectImage from '../components/selectImage';
import { uploadImage } from '../lib/storage';
import { registerRider } from '../lib/api';

export default function RiderRegister({ route, navigation }) {

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [city, setCity] = useState("");
  const [bikeNumber, setBikeNumber] = useState("");
  const [licenseImage, setLicenseImage] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageurl,setimageurl] = useState("")
  const [liecenceurl,setlienceurl] = useState("")
  const [Contact,setContact] = useState("")
  const { CustomerID } = route.params || {};

  const handle1stImage = async () => {
    if (!image || !licenseImage) {
      alert('Please select both the licence image and the profile image');
      return;
    }
    if (!name || !idCardNumber || !Contact) {
      alert('Name, ID card number and contact are required');
      return;
    }
    setUploading(true);
    try {
      const [profileUrl, licenceUrl] = await Promise.all([
        uploadImage(image, 'riders'),
        uploadImage(licenseImage, 'riders'),
      ]);
      await registerRider({
        Name: name,
        IDCardNumber: idCardNumber,
        City: city,
        BikeNumber: bikeNumber,
        LicenseImage: licenceUrl,
        RiderProfileImage: profileUrl,
        Contact: Contact,
        IsAvailable: isAvailable,
      });
      navigation.navigate('View Profile');
    } catch (error) {
      console.error('Rider registration failed:', error);
      alert(error?.message || 'Rider registration failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="ID Card Number"
          onChangeText={setIdCardNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          onChangeText={setCity}
        />
        <TextInput
          style={styles.input}
          placeholder="Bike Number"
          onChangeText={setBikeNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact"
          onChangeText={setContact}
        />
        <Text style={{color:'gray',marginTop:5}}>Select Licence Image</Text>
        <SelectImage  image={licenseImage} setImage={setLicenseImage}/>
        <Text style={{color:'gray',marginTop:5}}>Select Profile Image</Text>
        <SelectImage image={image} setImage={setImage} />
        <Button title={uploading ? "Registering..." : "Register"} onPress={handle1stImage} disabled={uploading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
