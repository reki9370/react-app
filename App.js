import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, LogBox, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, PanResponder, Animated } from 'react-native';
import Footer from './assets/Footer'
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { TextInput, Divider } from 'react-native-paper'; 
import { Cache } from 'react-native-cache';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cache = new Cache({
  namespace: "workout",
  policy: {
      stdTTL: 0 // the standard ttl as number in seconds, default: 0 (unlimited)
  },
  backend: AsyncStorage
});


LogBox.ignoreLogs(["Constants.platform.ios.model has been deprecated in favor of expo-device's Device.modelName property. This API will be removed in SDK 45."])

export default function App() {

  const rotationValue = useRef(new Animated.Value(0)).current;
  const dropdownRotationValue = useRef(new Animated.Value(0)).current;
  const[state, setState] = useState('home')
  const[dropdownOpen, setDropdownOpen] = useState(false)
  const[weight, setWeight] = useState(0)

  useEffect(() => {
    cache.getAll().then((cachedData => {
      setWeight(cachedData['weight'].value)
    }))    
  }, []);

  const handleSettings = () => {
      setState('settings')
      setDropdownOpen(false)
      Animated.timing(rotationValue, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
      }).start(() => {
          rotationValue.setValue(0);
      });

      // Additional logic or state changes upon click
  };

  const toggleDropdown = () => {
    Animated.timing(dropdownRotationValue, {
        toValue: dropdownOpen ? 1: 0,
        duration: 1,
        useNativeDriver: true,
    }).start(() => {
      setDropdownOpen(!dropdownOpen)
    });
  }

  const rotationInterpolate = rotationValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['0deg', '180deg', '0deg'],
  });

  const dropdownRotationInterpolate = dropdownRotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
});
    
  const animatedStyles = {
      transform: [{ rotate: rotationInterpolate }],
  };

  const dropdownStyles = {
    transform: [{ rotate: dropdownRotationInterpolate }]
  }

  const doneEditingWeight = () => {
    console.log("Setting weight to: ", weight);
    cache.set('weight', weight);
  }

  if(state == 'home')
  {
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'black'}}>
        <View style={styles.container}>
          <View style={styles.header}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', flex:1, textAlign:'left', marginLeft:'3%'}}>Home</Text>
              <TouchableOpacity activeOpacity={1} onPress={() => handleSettings()} style={{ marginRight:'3%'}}>
                  <Animated.View style={animatedStyles}>
                      <Ionicons style={{textAlign:'right'}} name="ios-settings-sharp" size={30} color={state == 'settings' ? 'grey': 'white'} />
                  </Animated.View>
              </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.bodyText}>Home Screen Stuff</Text>
          </ScrollView>
          <Footer dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} state={state} setState={setState}/>
        </View>
      </SafeAreaView>
    ) 
  }
  else if(state == 'run')
  {
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'black'}}>
        <View style={styles.container}>
          <View style={styles.header}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', flex:1, textAlign:'left', marginLeft:'3%'}}>Running</Text>
              <TouchableOpacity activeOpacity={1} onPress={() => handleSettings()} style={{ marginRight:'3%'}}>
                  <Animated.View style={animatedStyles}>
                      <Ionicons style={{textAlign:'right'}} name="ios-settings-sharp" size={30} color={state == 'settings' ? 'grey': 'white'} />
                  </Animated.View>
              </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.bodyText}>Running Screen Stuff</Text>
          </ScrollView>
          <Footer dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} state={state} setState={setState} />
        </View>
      </SafeAreaView>
    )
  }
  else if(state == 'lift')
  {
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'black'}}>
        <View style={styles.container}>
          <View style={styles.header}>
              <TouchableOpacity onPress={() => toggleDropdown()} activeOpacity={1} style={{flexDirection:'row', flex: 1, alignItems:'center'}}>
                <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', textAlign:'left', marginLeft:'3%'}}>Lifting </Text>
                <Animated.View style={dropdownStyles}> 
                  <MaterialIcons name="arrow-drop-down" size={24} color="white" />
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={() => handleSettings()} style={{ marginRight:'3%'}}>
                  <Animated.View style={animatedStyles}>
                      <Ionicons style={{textAlign:'right'}} name="ios-settings-sharp" size={30} color={state == 'settings' ? 'grey': 'white'} />
                  </Animated.View>
              </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.bodyText}>Lifting Screen Stuff</Text>
          </ScrollView>
          {dropdownOpen && 
            <View style={{ position: 'absolute', top: '9%', left: '3%', flex: 1, paddingVertical: 20, paddingHorizontal:15, borderRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, backgroundColor: '#fff' }} >
              <View style={{flexDirection:'row', marginTop: 10}}>
                <Text>
                  <Text style={{fontSize: 20}}>Update Weight</Text>
                </Text>
                <FontAwesome5 style={{marginLeft: 8}} name="weight" size={24} color="black" />
              </View>
              <TextInput
                style={{marginTop: 10}}
                label='Weight'
                mode='outlined'
                returnKeyType='done'
                value={weight}
                keyboardType='numeric'
                onChangeText={(newWeight) => {setWeight(newWeight)}}
                onSubmitEditing={() => {doneEditingWeight()}}
              />
              <Divider style={{marginTop: 20, marginBottom: 20}}/>
              <View style={{flexDirection:'row', marginBottom:10}}>
                <TouchableOpacity>
                  <Text style={{fontSize: 20}}>Add Workout</Text>
                </TouchableOpacity>
                <Entypo style={{marginLeft: 8}} name="circle-with-plus" size={24} color="black" />
              </View>
            </View>
          }
          <Footer state={state} dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} setState={setState} />
        </View>
      </SafeAreaView>
    )
  }
  else if(state == 'settings')
  {
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'black'}}>
        <View style={styles.container}>
          <View style={styles.header}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', flex:1, textAlign:'left', marginLeft:'3%'}}>Settings</Text>
              <TouchableOpacity activeOpacity={1} onPress={() => handleSettings()} style={{ marginRight:'3%'}}>
                  <Animated.View style={animatedStyles}>
                      <Ionicons style={{textAlign:'right'}} name="ios-settings-sharp" size={30} color={state == 'settings' ? 'grey': 'white'} />
                  </Animated.View>
              </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.body}>
            <Ionicons name="ios-settings-sharp" size={75} color="grey" />
          </ScrollView>
          <Footer dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} state={state} setState={setState} />
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: '10%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:'row'
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20, // Add paddingBottom if needed
  },
  bodyText: {
    fontSize: 18,
  },
  chartContainer: {
    marginVertical: 20,
    borderRadius: 8,
    elevation: 3,
    borderWidth: 3
  },
});