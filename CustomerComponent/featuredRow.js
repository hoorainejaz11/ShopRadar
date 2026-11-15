import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { themeColors } from '../theme';
import RestaurentCard1 from './RestaurentCard1';
import { useNavigation } from '@react-navigation/native';

const keyExtractor = (item, index) => String(item.VendorID ?? index);
const renderCard = ({ item }) => <RestaurentCard1 item={item} />;

function FeaturedRow({ title, description, restaurants }) {
  const navigation = useNavigation()
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{title}</Text>
          <Text style={{ color: '#6B7280', fontSize: 14 }}>{description}</Text>
        </View>
        <TouchableOpacity onPress={()=>navigation.navigate('SelectedCategory',  title )}>
          <Text style={{ color: themeColors.text, fontWeight: '600' }}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={restaurants}
        keyExtractor={keyExtractor}
        renderItem={renderCard}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        style={{ paddingVertical: 20, overflow: 'visible' }}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={false}
      />
    </View>
  );
}

export default React.memo(FeaturedRow);
