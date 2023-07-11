import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons'; 

export default function Footer ({state, setState, setWeightError}) {

    return (
        <View style={styles.footer}>
            <TouchableOpacity activeOpacity={1} onPress={() => {setState('home'); setWeightError(false)}} style={{flex:1, alignContent: 'center', alignItems:'center', justifyContent:'center'}}>
                <Ionicons name="home" size={35} style={{textAlign:'center'}} color={state == 'home' ? 'black': '#9E9E9E'} />
                <Text> Home </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} onPress={() => {setState('run'); setWeightError(false);}}  style={{flex:1, alignContent: 'center', alignItems:'center', justifyContent:'center'}}>
                <MaterialCommunityIcons name="run" size={35} style={{ textAlign:'center'}} color={state == 'run' ? 'black': '#9E9E9E'} />
                <Text> Running </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} onPress={() => setState('lift')} style={{flex:1, alignContent: 'center', alignItems:'center', justifyContent:'center'}}>
                <MaterialCommunityIcons name="weight-lifter" size={35} style={{textAlign:'center'}} color={state == 'lift' ? 'black': '#9E9E9E'} />
                <Text> Lifting </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        height: '9%',
        backgroundColor: '#F6F6F6',
        borderTopWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    }
});