import React from 'react';
import { View, Text, Image, TouchableWithoutFeedback ,StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Icon from 'react-native-feather';
import { themeColors } from '../theme';

function RestaurentCard1({ item }) {
  const navigation = useNavigation();
  return (
    <TouchableWithoutFeedback onPress={() => navigation.navigate('ShopScreen', { ...item })}>
      <View style={styles.container}>
        <Image style={{ height: 144, width: 256, borderTopLeftRadius: 25, borderTopRightRadius: 25 }} source={{ uri:item.Image}} />
        <View style={{ paddingHorizontal: 12, paddingBottom: 16, marginVertical: 5 }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 5 }}>{item.BusinessName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 }}>
            <Image style={{ height: 16, width: 16 }} source={require("../assets/star-icon-19125.png")} />
            <Text style={{ fontSize: 10 }} numberOfLines={1}>
              <Text style={{ color: '#047857' }}>{item.AverageRating ?? '-'}</Text>
              <Text style={{ color: '#4B5563' }}> ({item.RatingCount ?? 0}) Reviews</Text>
              <Text style={{ fontWeight: '600' }}> · {item.ShopCategory}</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 }}>
            <Icon.MapPin color="gray" width="15" height="15" />
            <Text numberOfLines={1} style={{ color: '#4B5563', fontSize: 13, flex: 1 }}> {item.Market}</Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
    container: {
      width: 256, // fixed so long shop names can't stretch the card
      marginRight: 24,
      marginBottom:10,            // mr-6 (assuming 4 pixels per unit)
      backgroundColor: '#FFFFFF', // bg-white
      borderRadius: 25,           // rounded-3xl (assuming 12 pixels per unit)
      shadowColor: '#000000',     // shadow-lg
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  });

export default React.memo(RestaurentCard1);
