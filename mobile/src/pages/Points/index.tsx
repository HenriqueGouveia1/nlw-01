import React, {useState, useEffect} from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import {View, StyleSheet, Text,Image, TouchableOpacity, ScrollView, Alert} from 'react-native';
import Constants from 'expo-constants';
import {useNavigation, useRoute} from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location'
import api from '../../services/api'

interface Item{
  image_url: string;
  id: number;
  title: string;
  latitude: number;
  longitude: number;
}

interface Point{
  id: number;
  name: string;
  image: string;
  image_url: string;
  latitude: number;
  longitude: number;
}

interface Params{
  uf: string;
  city: string;
}
const Points = () =>{
  const[itens,setItens]= useState<Item[]>([]) 
  const[points,setPoints]= useState<Point[]>([]) 
  const[selectedItens,setSelectedItens]= useState<number[]>([]) 
  const navigation = useNavigation();    
   
  const route = useRoute()
  const routeParams = route.params as Params

  const[inicialPosition, setInicialPosition] = useState<[number,number]>([0,0])

  useEffect(()=>{
   async function loadPosition(){
    const {status} = await Location.requestPermissionsAsync();

    if(status != 'granted'){
      Alert.alert('PEPEGA','ME DA A LOCALIZAÇÃO PEPEGA')
      return;
    }
      const location = await Location.getCurrentPositionAsync();

      const {latitude, longitude} = location.coords;
      
      
    setInicialPosition([
      latitude,
      longitude
    ])
    
  }
    loadPosition()
},[])
   
  useEffect(()=>{
    api.get('itens').then(response=>{
      setItens(response.data);
    })
},[])

useEffect(()=>{
  api.get('points',{
    params:{
      city: routeParams.city,
      uf: routeParams.uf, 
      itens: selectedItens
    }
  }).then(response=>{
    setPoints(response.data);
  })
},[selectedItens]); 
   
    function handleNavigateBack(){
       navigation.goBack()
    }

    function handleNavigateToDetails(id:number){
      navigation.navigate('Details', {point_id : id});
    }

    function handleSelectItem(id: number) {
      const alreadySelected = selectedItens.findIndex(item => item === id);

      if(alreadySelected >= 0){
          const filteredItens = selectedItens.filter(item => item !== id);
          setSelectedItens(filteredItens);

      }else{
          setSelectedItens([...selectedItens, id]);
      }
      
  }
    return (

      <>
        <View style={styles.container}>
            <TouchableOpacity onPress={handleNavigateBack}>
                <Icon name="arrow-left" size={20} color="#34cb79"/>
            </TouchableOpacity>
            <Text style={styles.title}>Bem Vindo!</Text>
            <Text style={styles.description}>Encontre um ponto de coleta.</Text>
            
            <View style={styles.mapContainer}>
                {inicialPosition[0] !==0 &&(
              <MapView style={styles.map} 
                  loadingEnabled={inicialPosition[0]===0}
                  initialRegion={{latitude:inicialPosition[0] , longitude: inicialPosition[1], latitudeDelta:0.014, longitudeDelta:0.014}}
                  >
                {console.log('points: ', points)}
                 {points.map((point) => (
                <Marker
                  key={String(point.id)}
                  onPress={() => handleNavigateToDetails(point.id)}
                  style={styles.mapMarker}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                >
                    
                  <View style={styles.mapMarkerContainer}>
                    <Image style={styles.mapMarkerImage} source={{uri: point.image_url}}/>
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                 
                </Marker> 
                 ))}
                </MapView>
                
                )}
            </View>
        
        </View>
        <View style={styles.itemsContainer}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false}  contentContainerStyle={{paddingHorizontal:20}}>
          {itens.map(item=>(
            <TouchableOpacity key={String(item.id)}
            style={[styles.item,
               selectedItens.includes(item.id)? styles.selectedItem : {}
            ]}
             onPress={()=>handleSelectItem(item.id)} >
            <SvgUri width={42} height={42} uri={item.image_url} />
            <Text style={styles.itemTitle}>{item.title}</Text>
           </TouchableOpacity>
          ))}      
         </ScrollView>
   
     </View>
        
    </> 
    );    
}; 

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 20 + Constants.statusBarHeight,
    },
      
      title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });

export default Points;