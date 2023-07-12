import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, LogBox, TouchableOpacity, ScrollView, SafeAreaView, Animated, Keyboard, Alert } from 'react-native';
import Footer from './assets/Footer'
import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome, Feather } from '@expo/vector-icons';
import { Button, TextInput, Divider } from 'react-native-paper'; 
import { Cache } from 'react-native-cache';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Draggable from 'react-native-draggable';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

const config = {
  clientId: '1059372138625-73eqk2ddf0kuv853idtv16k0kngs9kve.apps.googleusercontent.com',
};

/*
  IDEAS: 

    -Maybe replace running tab with food/nutrition page
      -Could track calorie intake/macros and other important nutrition factors on this page
    -Allow user to add workouts. Workouts will be comprised of exercises and the number of sets + reps for each exercise. User can name workouts and give them descriptions.
      -For example, user could create a leg day workout routine and add the exercises that make up that workout. Then, they could just pull up that workout their next leg day
      -Provide user with blanket list of exercises like bench, curls, squats, etc.
      -Allow user to add custom exercises
    -Allow user to log workouts they complete (select workout from list of previous workouts or create new workout)
    -Allow user to also log their measurements like weight, bmi, muscle measurements.
    -Allow user to tag in a photo or two with each log to track visual progress.
    -Create trends tab to display user data in a readable format (track trends in weight, bmi, muscle measurements)
    -Allow for user to view some compilation of their progress pictures (slideshow or short video)
      -react-native-images-to-video: https://www.npmjs.com/package/react-native-images-to-video
    
    Need to get some form of database up and running for most of these features, especially those involving storing photos or elaborate workouts.
*/

const cache = new Cache({
  namespace: "workout",
  policy: {
      stdTTL: 0 // the standard ttl as number in seconds, default: 0 (unlimited)
  },
  backend: AsyncStorage
});


const plateTemplate = {
  45: <View style={{borderWidth:1, height:110, width:10, borderRadius:3}}></View>,
  35: <View style={{borderWidth:1, height:90, width:10, borderRadius:3}}></View>,
  25: <View style={{borderWidth:1, height:65, width:10, borderRadius:3}}></View>,
  10: <View style={{borderWidth:1, height:45, width:7, borderRadius:2}}></View>,
  5: <View style={{borderWidth:1, height:30, width:7, borderRadius:2}}></View>,
  2.5: <View style={{borderWidth:1, height:20, width:5, borderRadius:1.5}}></View>
}

const bar = <View style={{borderWidth:1, height:7, width:150, borderLeftWidth:0, borderRightWidth:0}}></View>
const leftBar = <View style={{borderWidth:1, height:5, width:10, borderRightWidth:0}}></View>
const rightBar = <View style={{borderWidth:1, height:5, width:10, borderLeftWidth:0}}></View>
const leftCap = <View style={{borderWidth:1, height:10, width:3, borderLeftWidth:0}}></View>
const rightCap = <View style={{borderWidth:1, height:10, width:3, borderRightWidth:0}}></View>

const weights = [45, 35, 25, 10, 5, 2.5]
const BAR_WEIGHT = 45

LogBox.ignoreLogs(["Constants.platform.ios.model has been deprecated in favor of expo-device's Device.modelName property. This API will be removed in SDK 45.",
'The useProxy'])

WebBrowser.maybeCompleteAuthSession();
const useProxy = true;
const redirectUri = AuthSession.makeRedirectUri({
  useProxy,
});

console.log(redirectUri)


export default function App() {

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId: '1059372138625-krlkmvf535sj6a15lbgvcrkdemgsmf5e.apps.googleusercontent.com',
      redirectUri: redirectUri,
      scopes: ['openid', 'profile', 'email'],
    }
  );

  const rotationValue = useRef(new Animated.Value(0)).current;
  const[state, setState] = useState('home')
  const[dropdownOpen, setDropdownOpen] = useState(false)
  const[plateCalculatorOpen, setPlateCalculatorOpen] = useState(false)
  const[weight, setWeight] = useState(0)
  const[plateWeight, setPlateWeight] = useState(0)
  const[displayWeightGraphic, setDisplayWeightGraphic] = useState(null)
  const[displayWeights, setDisplayWeights] = useState(null)
  const[weightError, setWeightError] = useState(false)
  const[weightErrorMessage, setWeightErrorMessage] = useState("")
  const[weightQuantities, setWeightQuantities] = useState({})
  const[settingsChanged, setSettingsChanged] = useState(false)
  const[userProfile, setUserProfile] = useState({})



  useEffect(() => {
    cache.getAll().then((cachedData => {
      if(cachedData['weight'] != undefined)
      {
        setWeight(cachedData['weight'].value)
      }
      if(cachedData['weightconfig'] != undefined)
      {
        setWeightQuantities(cachedData['weightconfig'].value)
      }
    }))  
    
    let workout = {
      legDay:{
        squats:{
          reps: 10,
          sets: 4 
        },
        lunges:{
          reps: 20,
          sets: 3
        }
      }
    }
    
    /*
    axios.post('http://192.168.67.239:3000/api/add-workout', 
    {
      ID: 1,
      workout: JSON.stringify(workout)
    }).then((response) => {
      axios.post('http://192.168.67.239:3000/api/ping-oracle', 
      {
        ID: 1,
        workout: workout
      }).then((response) => {
        let obj = JSON.parse(response.data.WORKOUTS)

        for(element in obj)
        {
          for(workout in obj[element])
          {
            console.log(workout, obj[element][workout])
            Alert.alert('Alert Title', 'My Alert Msg', [
              {
                text: 'Exercise straight from Oracle: ' + workout,
                onPress: () => console.log('Ask me later pressed'),
              }
            ]);
          }
        }
      })
    })
    */

  }, []);

  useEffect(() => {
    if(state != 'lift')   
    {
      setPlateCalculatorOpen(false)
      setDropdownOpen(false)
    }
  }, [state]);

  const handleSettings = () => {
      setState('settings')
      setWeightError(false)
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
      if(dropdownOpen)
      {
        setWeightError(false)
      }
      setDropdownOpen(!dropdownOpen)
  }

  const handlePlateCalculate = () => {
    let plateObj = calculateWeights(plateWeight)

    if(plateObj == 'not possible')
    {
      setWeightError(true)
    }
    else
    {
      setWeightError(false)
      let children = []

      let weightChildren = []

      let leftBarNew = React.cloneElement(leftBar)
      leftBarNew.key = 'left bar'
      children.push(leftBarNew)

      let keys = Object.keys(plateObj)

      keys.sort(function(a, b){return a-b})

      for(let i = 0; i < keys.length; i++)
      {
        weightChildren.push(<Text key={keys[i] + plateObj[keys[i]]}>{`\u2022${plateObj[keys[i]]} x ${keys[i]} lb`}</Text>)
        
        for(let y = 0; y < plateObj[keys[i]]; y++)
        {
          let newTemplateThing = React.cloneElement(plateTemplate[keys[i]])
          newTemplateThing.key = i + 'graphic' + y
          children.push(newTemplateThing)
        }
      }

      if(keys.length == 0)
      {
        let rightEmptyCapNew = React.cloneElement(rightCap)
        leftBarNew.key = 'right empty cap'
        children.push(rightEmptyCapNew)
      }
      let leftCapNew = React.cloneElement(leftCap)
      leftBarNew.key = 'left cap'
      children.push(leftCapNew)
      let barNew = React.cloneElement(bar)
      barNew.key = 'left bar'
      children.push(barNew)
      let rightCapNew = React.cloneElement(rightCap)
      rightCapNew.key = 'right cap'
      children.push(rightCapNew)
      if(keys.length == 0)
      {
        let leftEmptyCapNew = React.cloneElement(leftCap)
        leftEmptyCapNew.key = 'left empty cap'
        children.push(leftEmptyCapNew)
      }

      keys.sort(function(a, b){return b-a})

      for(let i = 0; i < keys.length; i++)
      {
        for(let y = 0; y < plateObj[keys[i]]; y++)
        {
          let newTemplateThing = React.cloneElement(plateTemplate[keys[i]])
          newTemplateThing.key = i + 'graphicnew' + y
          children.push(newTemplateThing)
        }
      }

      let rightBarNew = React.cloneElement(rightBar)
      rightBarNew.key = 'right bar'
      children.push(rightBarNew)

      setDisplayWeightGraphic(children)
      setDisplayWeights(weightChildren)
      Keyboard.dismiss()
      setPlateCalculatorOpen(true)
    }

  }

  const calculateWeights = (desiredWeight) => {
    if(desiredWeight > 1000)
    {
      setWeightErrorMessage('Choose Lower Weight')
      return 'not possible';
    }
    else if(desiredWeight < Number(weightQuantities['bar weight']) || desiredWeight % 5 != 0 || desiredWeight > 1000)
    {
      setWeightErrorMessage('Weight Configuration Not Possible')
      return 'not possible';
    }
    
    let newWeight
    if(weightQuantities['bar weight'] != undefined)
    {
      newWeight = desiredWeight - weightQuantities['bar weight']
    }
    else
    {
      newWeight = desiredWeight - BAR_WEIGHT
    }

    let available_weights = {}

    for(element in weights)
    {
      console.log(weights[element])
      if(weightQuantities[weights[element]] == undefined)
      {
        available_weights[weights[element]] = 0
      }
      else
      {
        available_weights[weights[element]] = weightQuantities[weights[element]]
      }
    }
    
    let weightList = {}
  
    for(let i = 0; i < weights.length; i++)
    {
      let quantity = 0
      while(available_weights[weights[i]] >= 2 && newWeight - (2 * weights[i]) >= 0)
      {
        quantity += 1
        available_weights[weights[i]] -= 2
        newWeight = newWeight - (2 * weights[i])
      }
  
      if(quantity > 0)
      {
        weightList[weights[i]] = quantity
      }
    }

    console.log("remainder: ", newWeight)

    if(newWeight > 0)
    {
      setWeightErrorMessage('Not Possible With Your Weight Configuration')
      return 'not possible'
    }
  
    return weightList
  }

  const rotationInterpolate = rotationValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['0deg', '180deg', '0deg'],
  });
    
  const animatedStyles = {
      transform: [{ rotate: rotationInterpolate }],
  };

  const doneEditingWeight = () => {
    cache.set('weight', weight);
  }

  const login = async () => {
    let login = await promptAsync();
    console.log(login.authentication)

    axios.get(
      'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
      {
        headers: { authorization: "Bearer " +  login.authentication.accessToken},
      }
    ).then((result) => {
      console.log("data: ", result.data)
      setUserProfile(result.data)
    }).catch((error) => {
      console.log("error: ", error)
    });
  }

  const cacheWeightConfig = () => {
    console.log('setting config')
    setSettingsChanged(false)
    cache.set('weightconfig', weightQuantities)
  }

  if(state == 'home')
  {
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'black'}}>
        <View style={styles.container}>
          <View style={styles.header}>
              <Text style={{color:'white', fontWeight:'bold', fontSize:20, marginLeft:10}}>
                User: {userProfile['name'] || "None"}
              </Text>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', flex:1, textAlign:'left', marginLeft:'3%'}}>Home</Text>
              <TouchableOpacity activeOpacity={1} onPress={() => handleSettings()} style={{ marginRight:'3%', flex:1}}>
                  <Animated.View style={animatedStyles}>
                      <Ionicons style={{textAlign:'right'}} name="ios-settings-sharp" size={30} color={state == 'settings' ? 'grey': 'white'} />
                  </Animated.View>
              </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.bodyText}>Home Screen Stuff</Text>
          </ScrollView>
          <Button disabled={false} icon="check" mode="text" textColor='black' onPress={() => {login();}}>
              <Text style={{fontWeight: settingsChanged ? 'bold': 'normal'}}>Login With Google</Text>
            </Button>
          <Footer dropdownOpen={dropdownOpen} setWeightError={setWeightError} state={state} setState={setState}/>
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
          <Footer dropdownOpen={dropdownOpen} setWeightError={setWeightError} state={state} setState={setState} />
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
                  <MaterialIcons name="arrow-drop-down" style={{ transform: [{ rotate: dropdownOpen ? '0deg': '180deg' }] }} size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} onPress={() => handleSettings()} style={{ marginRight:'3%'}}>
                    <Animated.View style={animatedStyles}>
                        <Ionicons style={{textAlign:'right'}} name="ios-settings-sharp" size={30} color={state == 'settings' ? 'grey': 'white'} />
                    </Animated.View>
                </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={{marginTop: '3%', justifyContent:'center', alignItems:'center'}}> 
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
                <Text> EXAMPLE TEXT </Text>
              </View>
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
                  value={weight+''}
                  keyboardType='numeric'
                  onChangeText={(newWeight) => {setWeight(newWeight)}}
                  onEndEditing={() => {doneEditingWeight()}}
                />
                <Divider style={{marginTop: 20, marginBottom: 20}}/>
                <View style={{flexDirection:'row', marginBottom:10, alignItems: 'center'}}>
                  <Text style={{fontSize: 20}}>Plate Calculator</Text>
                  <TouchableOpacity onPress={() => {handlePlateCalculate()}}>
                    <Ionicons name="enter-sharp" size={28} style={{marginLeft:6}} color="black" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  label='Weight'
                  mode='outlined'
                  returnKeyType='done'
                  keyboardType='numeric'
                  value={plateWeight+''}
                  onChangeText={(newWeight) => {setPlateWeight(newWeight); setWeightError(false)}}
                  style={{marginBottom:3}}
                  error={weightError}
                />
                {weightError ? 
                  <View style={{flexDirection:'row', alignItems:'center'}}> 
                    <FontAwesome name="exclamation-circle" size={15} color="#B00020" />
                    <Text style={{ color:'#B00020', marginLeft:2}}>{weightErrorMessage}</Text>
                  </View>: null}
              </View>
            }
            {plateCalculatorOpen ?
              <Draggable touchableOpacityProps={{activeOpacity:1}} x={'50%'} y={150}>
                <View style={{ position: 'absolute', alignSelf:'center', flex: 1, paddingTop: 20, top:'30%', maxWidth:'100%', paddingHorizontal:15, borderRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, backgroundColor: '#fff' }} >
                  <View style={{alignItems:'center'}}>
                    <Text style={{fontWeight:'bold'}}>Plates (per side):</Text>
                    {displayWeights.map((element, index) => (
                      <React.Fragment key={index}>{element}</React.Fragment>
                    ))}
                  </View>
                  <View style={{marginTop: '3%', flexDirection:'row', maxWidth:'100%', alignItems:'center', justifyContent:'center'}}>
                    {displayWeightGraphic}
                  </View>
                  <View style={{flex: 1, marginTop: 20}}>
                    <TouchableOpacity onPress={() => {setPlateCalculatorOpen(false)}}>
                      <Feather style={{alignSelf:'flex-end'}} name="check" size={30} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Draggable>:
              null
            }
            <Footer state={state} dropdownOpen={dropdownOpen} setWeightError={setWeightError} setState={setState} />
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
          <ScrollView contentContainerStyle={{flex: 1, alignItems: 'center', paddingBottom: 20}}>
            <View style={{flexDirection:'row', marginTop: 20, marginBottom:10, alignItems: 'center'}}>
              <Text style={{fontSize: 25, fontWeight:'bold'}}>Configure Weights</Text>
            </View>
            <View style={{flexDirection:'row', marginBottom:10, alignItems: 'center'}}>
              <TextInput
                label='Bar Weight (lb)'
                mode='outlined'
                returnKeyType='done'
                keyboardType='numeric'
                value={weightQuantities['bar weight'] || ''}
                onChangeText={(newWeight) => {setSettingsChanged(true); setWeightQuantities((oldWeightQuantities) => {
                  let newWeightQuantities = {...oldWeightQuantities}
                  newWeightQuantities['bar weight'] = newWeight
                  return newWeightQuantities
                })}}
                style={{flex:1, marginHorizontal:'15%'}}
              />
            </View>
            <View style={{flexDirection:'row', marginBottom:10, alignItems: 'center'}}>
              <TextInput
                label='Qty 45'
                mode='outlined'
                returnKeyType='done'
                keyboardType='numeric'
                value={weightQuantities['45'] || ''}
                onChangeText={(newQty) => {setSettingsChanged(true); setWeightQuantities((oldWeightQuantities) => {
                  console.log(oldWeightQuantities)
                  let newWeightQuantities = {...oldWeightQuantities}
                  newWeightQuantities['45'] = newQty
                  return newWeightQuantities
                })}}
                style={{flex:1, marginHorizontal:10}}
              />
              <TextInput
                label='Qty 35'
                mode='outlined'
                returnKeyType='done'
                keyboardType='numeric'
                value={weightQuantities['35'] || ''}
                onChangeText={(newQty) => {setSettingsChanged(true); setWeightQuantities((oldWeightQuantities) => {
                  let newWeightQuantities = {...oldWeightQuantities}
                  newWeightQuantities['35'] = newQty
                  return newWeightQuantities
                })}}
                style={{flex:1, marginHorizontal:10}}
              />
              <TextInput
                label='Qty 25'
                mode='outlined'
                returnKeyType='done'
                keyboardType='numeric'
                value={weightQuantities['25'] || ''}
                onChangeText={(newQty) => {setSettingsChanged(true); setWeightQuantities((oldWeightQuantities) => {
                  let newWeightQuantities = {...oldWeightQuantities}
                  newWeightQuantities['25'] = newQty
                  return newWeightQuantities
                })}}
                style={{flex:1, marginHorizontal:10}}
              />
            </View>
            <View style={{flexDirection:'row', marginBottom:10, alignItems: 'center'}}>
              <TextInput
                label='Qty 10'
                mode='outlined'
                returnKeyType='done'
                keyboardType='numeric'
                value={weightQuantities['10'] || ''}
                onChangeText={(newQty) => {setSettingsChanged(true); setWeightQuantities((oldWeightQuantities) => {
                  let newWeightQuantities = {...oldWeightQuantities}
                  newWeightQuantities['10'] = newQty
                  return newWeightQuantities
                })}}
                style={{flex:1, marginHorizontal:10}}
              />
              <TextInput
                label='Qty 5'
                mode='outlined'
                returnKeyType='done'
                keyboardType='numeric'
                value={weightQuantities['5'] || ''}
                onChangeText={(newQty) => {setSettingsChanged(true); setWeightQuantities((oldWeightQuantities) => {
                  let newWeightQuantities = {...oldWeightQuantities}
                  newWeightQuantities['5'] = newQty
                  return newWeightQuantities
                })}}
                style={{flex:1, marginHorizontal:10}}
              />
              <TextInput
                label='Qty 2.5'
                mode='outlined'
                returnKeyType='done'
                keyboardType='numeric'
                value={weightQuantities['2.5'] || ''}
                onChangeText={(newQty) => {setSettingsChanged(true); setWeightQuantities((oldWeightQuantities) => {
                  let newWeightQuantities = {...oldWeightQuantities}
                  newWeightQuantities['2.5'] = newQty
                  return newWeightQuantities
                })}}
                style={{flex:1, marginHorizontal:10}}
              />
            </View>
            <Button disabled={!settingsChanged} icon="check" mode="text" textColor='black' onPress={() => {cacheWeightConfig()}}>
              <Text style={{fontWeight: settingsChanged ? 'bold': 'normal'}}>Confirm Weight Configurations</Text>
            </Button>
          </ScrollView>
          <Footer dropdownOpen={dropdownOpen} setWeightError={setWeightError} state={state} setState={setState} />
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