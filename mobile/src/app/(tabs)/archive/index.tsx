import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  View,
} from 'react-native';

import { Screen } from '@/components/layout/screen';
import { SearchInput } from '@/components/search-input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';

import { useRateHistory } from '@/hooks/queries/use-rate-history';
import { useRates } from '@/hooks/queries/use-rates';
import { formatDateToApi, formatDisplayDate } from '@/lib/utils';

type DatePickerType = 'start' | 'end' | null;

// Formatowanie daty do formatu YYYY-MM-DD wymaganego przez API

function formatRate(value: number | string): string {
  return Number(value).toFixed(4).replace('.', ',');
}

export default function ArchiveScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Domyślny zakres dat (np. ostatni miesiąc)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });

  const [endDate, setEndDate] = useState(() => new Date());

  const [activeDatePicker, setActiveDatePicker] =
    useState<DatePickerType>(null);

  const from = formatDateToApi(startDate);
  const to = formatDateToApi(endDate);

  const isValidRange = from <= to && to <= formatDateToApi(new Date());

  // Pobieranie dostępnych walut z backendu
  const {
    data: currentRates,
    isPending: isRatesPending,
    isError: isRatesError,
    refetch: refetchRates,
  } = useRates();

  const currencies = currentRates?.rates ?? [];

  // Wybór waluty z listy zwróconej przez backend
  const selectedRate =
    currencies.find(item => item.code === selectedCurrency) ??
    currencies.find(item => item.code === 'USD') ??
    currencies[0];

  const currencyCode = selectedRate?.code ?? '';

  // Pobieranie danych historycznych z backendu (Endpoint: /rates/{code}/history?from&to)
  const {
    data: historyData,
    isPending,
    isFetching,
    isError,
    refetch,
  } = useRateHistory(
    currencyCode,
    isValidRange ? from : '',
    isValidRange ? to : '',
  );

  const rates = historyData?.rates ?? [];

  // Filtrowanie wpisów w historii
  const filteredRates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...rates]
      .reverse() // najnowsze na górze
      .filter(
        item =>
          item.date.includes(query) ||
          String(item.bid).includes(query) ||
          String(item.ask).includes(query),
      );
  }, [rates, searchQuery]);

  // Obliczenie zmiany procentowej (między pierwszym a ostatnim kursem w tabeli)
  const percentageChange = useMemo(() => {
    if (rates.length < 2) return null;

    const first = Number(rates[0].bid);
    const last = Number(rates[rates.length - 1].bid);

    if (!Number.isFinite(first) || first <= 0) {
      return null;
    }

    const change = ((last - first) / first) * 100;

    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  }, [rates]);

  const latestRate = rates.at(-1);

  const chartRates = rates.slice(-8);
  const chartValues = chartRates.map(rate => Number(rate.bid));

  const minRate = chartValues.length ? Math.min(...chartValues) : 0;

  const maxRate = chartValues.length ? Math.max(...chartValues) : 0;

  const chartRange = maxRate - minRate;

  const isStartPicker = activeDatePicker === 'start';
  const isEndPicker = activeDatePicker === 'end';
  const isPickerOpen = activeDatePicker !== null;

  const closeDatePicker = () => {
    setActiveDatePicker(null);
  };

  // Obsługa zmiany daty początkowej
  const onStartDateChange = (selectedDate?: Date) => {
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  // Obsługa zmiany daty końcowej
  const onEndDateChange = (selectedDate?: Date) => {
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleDateChange = (date?: Date) => {
    if (isStartPicker) {
      onStartDateChange(date);
    } else if (isEndPicker) {
      onEndDateChange(date);
    }
  };

  return (
    <Screen
      scrollable
      contentClassName="gap-4"
    >
      {/* 1. Nagłówek ekranu */}

      <Text className="text-muted-foreground text-xs">
        Historical exchange data
      </Text>

      {/* 2. Wyszukiwarka */}
      <SearchInput
        placeholder="Search date or rate..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 3. Wybór dat (Start Date & End Date) */}
      <View className="flex-row gap-3">
        {/* Start Date Picker Button */}
        <Pressable
          onPress={() => setActiveDatePicker('start')}
          className="flex-1 bg-card shadow-sm p-4 border border-border rounded-3xl"
        >
          <View className="flex-row justify-between items-center mb-1">
            <Text className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
              Start Date
            </Text>

            <Calendar
              size={14}
              className="text-muted-foreground"
            />
          </View>

          <Text className="font-bold text-foreground text-sm">
            {formatDisplayDate(startDate)}
          </Text>
        </Pressable>

        {/* End Date Picker Button */}
        <Pressable
          onPress={() => setActiveDatePicker('end')}
          className="flex-1 bg-card shadow-sm p-4 border border-border rounded-3xl"
        >
          <View className="flex-row justify-between items-center mb-1">
            <Text className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
              End Date
            </Text>

            <Calendar
              size={14}
              className="text-muted-foreground"
            />
          </View>

          <Text className="font-bold text-foreground text-sm">
            {formatDisplayDate(endDate)}
          </Text>
        </Pressable>
      </View>

      {/* Komponenty okna wyboru daty */}

      {/* iOS: modal z kalendarzem inline */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={isPickerOpen}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={closeDatePicker}
        >
          <View className="flex-1 justify-center bg-black/50 px-5">
            <View className="bg-card p-5 rounded-3xl">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-foreground text-lg">
                  {isStartPicker ? 'Start Date' : 'End Date'}
                </Text>

                <Pressable onPress={closeDatePicker}>
                  <Text className="font-semibold text-primary text-sm">
                    Done
                  </Text>
                </Pressable>
              </View>

              {isPickerOpen && (
                <DateTimePicker
                  value={isStartPicker ? startDate : endDate}
                  mode="date"
                  display="inline"
                  minimumDate={isEndPicker ? startDate : undefined}
                  maximumDate={isStartPicker ? endDate : new Date()}
                  onValueChange={(_, date) => {
                    handleDateChange(date);
                  }}
                  style={{
                    alignSelf: 'center',
                    width: '100%',
                  }}
                />
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Android: natywny dialog wyboru daty */}
      {Platform.OS === 'android' && isPickerOpen && (
        <DateTimePicker
          value={isStartPicker ? startDate : endDate}
          mode="date"
          display="default"
          minimumDate={isEndPicker ? startDate : undefined}
          maximumDate={isStartPicker ? endDate : new Date()}
          onValueChange={(_, date) => {
            handleDateChange(date);
            closeDatePicker();
          }}
          onDismiss={closeDatePicker}
        />
      )}

      {/* 4. Główna karta wykresu i wyboru waluty */}
      <View className="bg-card shadow-lg p-5 border border-border rounded-3xl">
        {/* Nagłówek karty z wyborem waluty */}
        <View className="flex-row justify-between items-center gap-3 mb-3">
          <Select
            value={
              selectedRate
                ? {
                    value: selectedRate.code,
                    label: `${selectedRate.code}/PLN`,
                  }
                : undefined
            }
            onValueChange={option => {
              if (option) {
                setSelectedCurrency(option.value);
              }
            }}
            disabled={isRatesPending || isRatesError || currencies.length === 0}
          >
            <SelectTrigger className="rounded-xl min-w-32">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>

            <SelectContent
              insets={{ right: 20 }}
              className="mt-2 rounded-3xl max-h-80"
            >
              <SelectGroup>
                <SelectLabel>Available currencies</SelectLabel>

                {currencies.map(currency => (
                  <SelectItem
                    key={currency.code}
                    value={currency.code}
                    label={`${currency.code} - ${currency.currency}`}
                  >
                    {currency.code} - {currency.currency}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {percentageChange && !isError && (
            <View className="bg-muted px-2.5 py-1 rounded-full">
              <Text className="font-bold text-foreground text-xs">
                {percentageChange}
              </Text>
            </View>
          )}
        </View>

        {/* Obsługa błędów pobierania listy walut */}
        {isRatesError && (
          <Pressable
            onPress={() => void refetchRates()}
            className="mb-3"
          >
            <Text className="text-destructive text-sm">
              Failed to load currencies. Tap to retry.
            </Text>
          </Pressable>
        )}

        {/* Obsługa ładowania, błędów i pustych wyników */}
        {!isValidRange ? (
          <Text className="text-destructive text-sm">Invalid date range.</Text>
        ) : isRatesPending || (isPending && currencyCode) ? (
          <ActivityIndicator />
        ) : isRatesError ? null : isError ? (
          <View className="gap-3">
            <Text className="text-destructive text-sm">
              Could not load historical rates.
            </Text>

            <Pressable onPress={() => void refetch()}>
              <Text className="font-semibold text-primary">Try again</Text>
            </Pressable>
          </View>
        ) : !latestRate ? (
          <Text className="text-muted-foreground text-sm">
            No exchange rates available for this period.
          </Text>
        ) : (
          <>
            {/* Aktualne wartości z ostatniego dostępnego notowania */}
            <View className="gap-2">
              <View>
                <Text className="text-muted-foreground text-xs">
                  Buy rate (bid)
                </Text>

                <Text className="font-bold text-foreground text-2xl">
                  {formatRate(latestRate.bid)} PLN
                </Text>
              </View>

              <View>
                <Text className="text-muted-foreground text-xs">
                  Sell rate (ask)
                </Text>

                <Text className="font-semibold text-foreground text-lg">
                  {formatRate(latestRate.ask)} PLN
                </Text>
              </View>
            </View>

            <Text className="mt-2 text-muted-foreground text-xs">
              Latest published rate: {latestRate.date}
            </Text>

            {/* Paski wykresu wizualnego */}
            <View className="flex-row justify-between items-end gap-1.5 pt-2 h-20">
              {chartRates.map((item, index) => {
                const value = Number(item.bid);

                const height =
                  chartRange === 0
                    ? 60
                    : 20 + ((value - minRate) / chartRange) * 80;

                return (
                  <View
                    key={item.date}
                    style={{ height: `${height}%` }}
                    className={`flex-1 rounded-t-lg ${
                      index === chartRates.length - 1
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                );
              })}
            </View>
          </>
        )}

        {isFetching && !isPending && (
          <Text className="mt-2 text-muted-foreground text-xs">
            Refreshing rates...
          </Text>
        )}
      </View>

      {/* 5. Sekcja: Recent Entries (Lista historyczna) */}
      <View>
        <Text className="mb-3 px-1 font-bold text-lg">Recent Entries</Text>

        {!isRatesPending &&
          !isPending &&
          !isError &&
          !isRatesError &&
          filteredRates.length === 0 && (
            <Text className="px-1 text-muted-foreground text-sm">
              No matching historical rates.
            </Text>
          )}

        <View className="gap-2.5">
          {!isError &&
            !isRatesError &&
            filteredRates.map(item => (
              <View
                key={item.date}
                className="bg-card shadow-sm p-4 border border-border rounded-3xl"
              >
                <View>
                  <Text className="font-bold text-sm">
                    {formatDisplayDate(item.date)}
                  </Text>

                  <Text className="mt-0.5 text-muted-foreground text-xs">
                    {currencyCode}/PLN
                  </Text>
                </View>

                <View className="flex-row justify-between mt-2">
                  <View>
                    <Text className="text-muted-foreground text-xs">Bid</Text>

                    <Text className="font-bold text-foreground text-base">
                      {formatRate(item.bid)}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-muted-foreground text-xs">Ask</Text>

                    <Text className="font-bold text-foreground text-base">
                      {formatRate(item.ask)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
        </View>
      </View>
    </Screen>
  );
}
