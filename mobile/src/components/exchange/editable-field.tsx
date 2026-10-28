import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  amount: string;
  setAmount: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  currencies: string[];
  disabled: boolean;
};

export function EditableField({
  amount,
  setAmount,
  currency,
  setCurrency,
  currencies,
  disabled,
}: Props) {
  return (
    <View className="flex-row gap-3">
      <Input
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        editable={!disabled}
        className="flex-1"
      />

      <Select
        value={{ label: currency, value: currency }}
        onValueChange={option => {
          if (option) setCurrency(option.value);
        }}
        disabled={disabled}
      >
        <SelectTrigger className="w-28">
          <SelectValue
            placeholder="Currency"
            className="font-bold"
          />
        </SelectTrigger>

        <SelectContent
          insets={{ right: 20 }}
          className="mt-2 rounded-3xl"
        >
          <SelectGroup>
            <SelectLabel>Currencies</SelectLabel>

            {currencies.map(code => (
              <SelectItem
                key={code}
                label={code}
                value={code}
              >
                {code}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
}
