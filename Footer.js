import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons'; 

export default function Footer ({state, setState, dropdownOpen, setDropdownOpen}) {

    return (
        <View style={styles.footer}>
            <TouchableOpacity activeOpacity={1} onPress={() => {setState('home'); setDropdownOpen(false)}} style={{flex:1, alignContent: 'center', justifyContent:'center'}}>
                <Ionicons name="home" size={35} style={{textAlign:'center'}} color={state == 'home' ? 'black': '#9E9E9E'} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} onPress={() => {setState('run'); setDropdownOpen(false)}}  style={{flex:1, alignContent: 'center', justifyContent:'center'}}>
                <MaterialCommunityIcons name="run" size={35} style={{ textAlign:'center'}} color={state == 'run' ? 'black': '#9E9E9E'} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} onPress={() => setState('lift')} style={{flex:1, alignContent: 'center', justifyContent:'center'}}>
                <MaterialCommunityIcons name="weight-lifter" size={35} style={{textAlign:'center'}} color={state == 'lift' ? 'black': '#9E9E9E'} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        height: '8%',
        backgroundColor: '#F6F6F6',
        borderTopWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    }
});