import { Ionicons } from '@expo/vector-icons'; 
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';

export default function Header ({state, setState, displayText}) {

    const rotationValue = useRef(new Animated.Value(0)).current;

    const handleSettings = () => {
        setState('settings')
        Animated.timing(rotationValue, {
            toValue: 1,
            duration: 550,
            useNativeDriver: true,
        }).start(() => {
            rotationValue.setValue(0);
        });

        // Additional logic or state changes upon click
    };

    const rotationInterpolate = rotationValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0deg', '180deg', '0deg'],
    });
    
    const animatedStyles = {
        transform: [{ rotate: rotationInterpolate }],
    };

    return (
        <View style={styles.header}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', flex:1, textAlign:'left', marginLeft:'3%'}}>{displayText}</Text>
            <TouchableOpacity activeOpacity={1} onPress={() => handleSettings()} style={{ marginRight:'3%'}}>
                <Animated.View style={animatedStyles}>
                    <Ionicons style={{textAlign:'right'}} name="ios-settings-sharp" size={30} color={state == 'settings' ? 'grey': 'white'} />
                </Animated.View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
      height: '10%',
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection:'row'
    }
  });