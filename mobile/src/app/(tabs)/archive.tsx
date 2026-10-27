import { Screen } from '@/components/layout/screen';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Archive, Calendar, ChevronDown, Search } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

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
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  );
  const [endDate, setEndDate] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [historyData, setHistoryData] = useState<NbpHistoryResponse | null>(
    null,
  );
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
          `https://api.nbp.pl/api/exchangerates/rates/a/${selectedCurrency}/${startStr}/${endStr}/?format=json`,
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
      .filter(
        item =>
          item.effectiveDate.includes(searchQuery) ||
          item.mid.toString().includes(searchQuery),
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
      <View className="mb-6 flex-row items-center justify-between px-1">
        <View>
          <Text className="text-2xl font-bold text-foreground">
            Archive Rates
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            Historical exchange data
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-sm">
          <Archive
            size={20}
            className="text-primary"
          />
        </View>
      </View>

      {/* 2. Wyszukiwarka */}
      <View className="mb-4 flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <Search
          size={18}
          className="mr-2.5 text-muted-foreground"
        />
        <Input
          placeholder=" Search date or rate..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="m-0 ml-2.5 flex-1 p-0 text-sm text-foreground"
        />
      </View>

      {/* 3. Wybór dat (Start Date & End Date) */}
      <View className="mb-4 flex-row gap-3">
        {/* Start Date Picker Button */}
        <Pressable
          onPress={() => setShowStartPicker(true)}
          className="flex-1 rounded-3xl border border-border bg-card p-4 shadow-sm"
        >
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Start Date
            </Text>
            <Calendar
              size={14}
              className="text-muted-foreground"
            />
          </View>
          <Text className="text-sm font-bold text-foreground">
            {startDate.toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })}
          </Text>
        </Pressable>

        {/* End Date Picker Button */}
        <Pressable
          onPress={() => setShowEndPicker(true)}
          className="flex-1 rounded-3xl border border-border bg-card p-4 shadow-sm"
        >
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              End Date
            </Text>
            <Calendar
              size={14}
              className="text-muted-foreground"
            />
          </View>
          <Text className="text-sm font-bold text-foreground">
            {endDate.toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })}
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
      <View className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-lg">
        {/* Nagłówek karty z wyborem waluty */}
        <View className="mb-3 flex-row items-center justify-between">
          <View>
            <Pressable
              onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex-row items-center gap-1 self-start rounded-xl border border-border/60 bg-muted/40 px-3 py-1.5"
            >
              <Text className="text-xs font-bold text-foreground">
                {selectedCurrency}/PLN
              </Text>
              <ChevronDown
                size={14}
                className="text-muted-foreground"
              />
            </Pressable>
          </View>
          <View className="rounded-full bg-emerald-100 px-2.5 py-1">
            <Text className="text-xs font-bold text-emerald-700">
              {percentageChange}
            </Text>
          </View>
        </View>

        {/* Lista rozwijana walut */}
        {showCurrencyDropdown && (
          <View className="mb-4 rounded-2xl border border-border bg-muted/90 p-2">
            {AVAILABLE_CURRENCIES.map(cur => (
              <Pressable
                key={cur.code}
                onPress={() => {
                  setSelectedCurrency(cur.code);
                  setShowCurrencyDropdown(false);
                }}
                className={`flex-row items-center justify-between rounded-xl p-2.5 ${selectedCurrency === cur.code ? 'bg-primary/20' : ''}`}
              >
                <Text className="text-xs font-semibold text-foreground">
                  {cur.code} - {cur.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text className="mb-4 text-2xl font-bold text-foreground">
          {historyData && historyData.rates.length > 0
            ? historyData.rates[historyData.rates.length - 1].mid
                .toFixed(4)
                .replace('.', ',')
            : 'Loading...'}
        </Text>

        {/* Paski wykresu wizualnego */}
        <View className="h-20 flex-row items-end justify-between gap-1.5 pt-2">
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
        <Text className="mb-3 px-1 text-lg font-bold text-foreground">
          Recent Entries
        </Text>

        <View className="gap-2.5">
          {filteredRates.map(item => (
            <View
              key={item.no}
              className="flex-row items-center justify-between rounded-3xl border border-border bg-card p-4 shadow-sm"
            >
              <View>
                <Text className="text-sm font-bold text-foreground">
                  {new Date(item.effectiveDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  {selectedCurrency}/PLN
                </Text>
              </View>
              <Text className="text-base font-bold text-foreground">
                {item.mid.toFixed(4).replace('.', ',')}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
