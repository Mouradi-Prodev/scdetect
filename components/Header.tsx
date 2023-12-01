import { View ,Text} from "./Themed";
import { StyleSheet } from 'react-native';

export default function Header({name}:{name:string}) {
    return (
        <>

            <View>
                <Text style={styles.text}>{name}</Text>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    text:{
        fontSize:20,
        color:'green'
    }
})