import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowDown, 
  ChevronDown, 
  Info 
} from 'lucide-react-native';
import TransferTopUpScreen from './home/transferTopUp';
import HomeScreen from './home/home';

export default function HomeBase() {
  const router = useRouter();
  const [ homeCard, setHomeCard] = useState('home');  
  const navigation = useNavigation();
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, (e) => {
      setHomeCard('home');
    });

    return unsubscribe;
  }, [navigation]);

  switch(homeCard) {
    case 'home':
      return <HomeScreen setHomeCard={setHomeCard} />;
    case 'transferTopUp':
      return <TransferTopUpScreen setHomeCard={setHomeCard} />;
    default:
      return <HomeScreen setHomeCard={setHomeCard} />;
  }

}
