// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// const initialSections = [
//   { id: '1', title: 'School' },
//   { id: '2', title: 'Personal' },
//   { id: '3', title: 'Work' },
// ];

// export default function HomeScreen() {
//   const [sections, setSections] = useState(initialSections);
//   const navigation = useNavigation(); // Get the navigation object

//   const renderSectionItem = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.sectionItem}
//       onPress={() => navigation.navigate('SectionDetail', { title: item.title })} // Navigate on press
//     >
//       <Text style={styles.sectionTitle}>{item.title}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={sections}
//         renderItem={renderSectionItem}
//         keyExtractor={(item) => item.id}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f8f8f8',
//   },
//   sectionItem: {
//     backgroundColor: '#fff',
//     padding: 20,
//     marginVertical: 8,
//     marginHorizontal: 16,
//     borderRadius: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });
