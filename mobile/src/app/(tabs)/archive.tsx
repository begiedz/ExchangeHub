import React, { useState, useEffect, useMemo } from 'react';
import { View, TextInput, ScrollView, Pressable, Platform } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Text } from '@/components/ui/text';
import { Search, Archive, Calendar, ChevronDown } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Input } from '@/components/ui/input';

interface HistoricalRate {
  no: string;
  effectiveDate: string;
  mid: number;
}

interface NbpHistoryResponse {
  table: string;
  currency: string;
  code: string;
  rates: HistoricalRate[];
}

// Przykładowa lista popularnych walut do wyboru
const AVAILABLE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'AUD', name: 'Australian Dollar' },
];

export default function ArchiveScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  
  // Domyślny zakres dat (np. ostatni miesiąc)
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [historyData, setHistoryData] = useState<NbpHistoryResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Formatowanie daty do formatu YYYY-MM-DD wymaganego przez API NBP
  const formatDateToApi = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Pobieranie danych historycznych z NBP API (Endpoint: /exchangerates/rates/{table}/{code}/{startDate}/{endDate}/)
  useEffect(() => {
    async function fetchHistoricalRates() {
      try {
        const startStr = formatDateToApi(startDate);
        const endStr = formatDateToApi(endDate);
        
        const response = await fetch(
          `https://api.nbp.pl/api/exchangerates/rates/a/${selectedCurrency}/${startStr}/${endStr}/?format=json`
        );
        if (response.ok) {
          const data = await response.json();
          setHistoryData(data);
        } else {
          setHistoryData(null);
        }
      } catch (error) {
        console.error('Błąd pobierania danych archiwum NBP:', error);
      }
    }
    fetchHistoricalRates();
  }, [selectedCurrency, startDate, endDate]);

  // Obsługa zmiany daty początkowej
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  // Obsługa zmiany daty końcowej
  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Filtrowanie wpisów w historii
  const filteredRates = useMemo(() => {
    if (!historyData?.rates) return [];
    return [...historyData.rates]
      .reverse() // najnowsze na górze
      .filter((item) =>
        item.effectiveDate.includes(searchQuery) ||
        item.mid.toString().includes(searchQuery)
      );
  }, [historyData, searchQuery]);

  // Obliczenie zmiany procentowej (między pierwszym a ostatnim kursem w tabeli)
  const percentageChange = useMemo(() => {
    if (!historyData?.rates || historyData.rates.length < 2) return '+0.00%';
    const first = historyData.rates[0].mid;
    const last = historyData.rates[historyData.rates.length - 1].mid;
    const diff = ((last - first) / first) * 100;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%`;
  }, [historyData]);

  return (
    <Screen scrollable>
      
      {/* 1. Nagłówek ekranu */}
      <View className="flex-row justify-between items-center mb-6 px-1">
        <View>
          <Text className="text-2xl font-bold text-foreground">Archive Rates</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">Historical exchange data</Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-card border border-border items-center justify-center shadow-sm">
          <Archive size={20} className="text-primary" />
        </View>
      </View>

      {/* 2. Wyszukiwarka */}
      <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3 mb-4 shadow-sm">
        <Search size={18} className="text-muted-foreground mr-2.5" />
        <Input
          placeholder=" Search date or rate..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-foreground text-sm p-0 m-0 ml-2.5"
        />
      </View>

      {/* 3. Wybór dat (Start Date & End Date) */}
      <View className="flex-row gap-3 mb-4">
        
        {/* Start Date Picker Button */}
        <Pressable 
          onPress={() => setShowStartPicker(true)}
          className="flex-1 bg-card border border-border rounded-3xl p-4 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Start Date</Text>
            <Calendar size={14} className="text-muted-foreground" />
          </View>
          <Text className="text-foreground font-bold text-sm">
            {startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
          </Text>
        </Pressable>

        {/* End Date Picker Button */}
        <Pressable 
          onPress={() => setShowEndPicker(true)}
          className="flex-1 bg-card border border-border rounded-3xl p-4 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">End Date</Text>
            <Calendar size={14} className="text-muted-foreground" />
          </View>
          <Text className="text-foreground font-bold text-sm">
            {endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
          </Text>
        </Pressable>
      </View>

      {/* Komponenty okna wyboru daty */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          maximumDate={endDate}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      )}

      {/* 4. Główna karta wykresu i wyboru waluty */}
      <View className="bg-card border border-border rounded-3xl p-5 shadow-lg mb-6">
        
        {/* Nagłówek karty z wyborem waluty */}
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Pressable 
              onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex-row items-center gap-1 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/60 self-start"
            >
              <Text className="text-xs font-bold text-foreground">{selectedCurrency}/PLN</Text>
              <ChevronDown size={14} className="text-muted-foreground" />
            </Pressable>
          </View>
          <View className="bg-emerald-100 px-2.5 py-1 rounded-full">
            <Text className="text-emerald-700 text-xs font-bold">{percentageChange}</Text>
          </View>
        </View>

        {/* Lista rozwijana walut */}
        {showCurrencyDropdown && (
          <View className="bg-muted/90 rounded-2xl p-2 mb-4 border border-border">
            {AVAILABLE_CURRENCIES.map((cur) => (
              <Pressable
                key={cur.code}
                onPress={() => {
                  setSelectedCurrency(cur.code);
                  setShowCurrencyDropdown(false);
                }}
                className={`p-2.5 rounded-xl flex-row justify-between items-center ${selectedCurrency === cur.code ? 'bg-primary/20' : ''}`}
              >
                <Text className="text-foreground font-semibold text-xs">{cur.code} - {cur.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text className="text-2xl font-bold text-foreground mb-4">
          {historyData && historyData.rates.length > 0 
            ? historyData.rates[historyData.rates.length - 1].mid.toFixed(4).replace('.', ',')
            : 'Loading...'}
        </Text>

        {/* Paski wykresu wizualnego */}
        <View className="flex-row justify-between items-end h-20 pt-2 gap-1.5">
          {historyData?.rates.slice(-8).map((item, index, arr) => {
            const isHighest = index === arr.length - 1;
            return (
              <View
                key={item.no}
                style={{ height: `${Math.max(20, (item.mid / 5) * 100)}%` }}
                className={`flex-1 rounded-t-lg ${isHighest ? 'bg-primary' : 'bg-muted'}`}
              />
            );
          })}
        </View>
      </View>

      {/* 5. Sekcja: Recent Entries (Lista historyczna) */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-foreground mb-3 px-1">Recent Entries</Text>
        
        <View className="gap-2.5">
          {filteredRates.map((item) => (
            <View
              key={item.no}
              className="bg-card border border-border rounded-3xl p-4 flex-row items-center justify-between shadow-sm"
            >
              <View>
                <Text className="text-foreground font-bold text-sm">
                  {new Date(item.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {selectedCurrency}/PLN
                </Text>
              </View>
              <Text className="text-foreground font-bold text-base">
                {item.mid.toFixed(4).replace('.', ',')}
              </Text>
            </View>
          ))}
        </View>
      </View>

    </Screen>
  );
}