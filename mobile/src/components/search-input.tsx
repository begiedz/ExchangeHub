import { Search } from 'lucide-react-native';
import { View, type TextInputProps } from 'react-native';

import { Input } from '@/components/ui/input';

type SearchInputProps = TextInputProps;

export function SearchInput({
  placeholder = 'Search...',
  ...props
}: SearchInputProps) {
  return (
    <View className="flex-row items-center rounded-full border border-border bg-card px-4 py-1 shadow-sm">
      <Search
        size={18}
        color="#94a3b8"
      />

      <Input
        placeholder={placeholder}
        {...props}
        className="flex-1 border-transparent bg-transparent focus:border-transparent"
      />
    </View>
  );
}
