import { useState } from "react";
import { Text, TextInput, View, type NativeSyntheticEvent, type TextInputSubmitEditingEventData } from "react-native";
import { colors } from "@/lib/theme";

type FormInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  onSubmitEditing?: (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
};

export function FormInput({ label, value, onChangeText, placeholder, multiline, onSubmitEditing }: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      <Text className="mb-1 text-sm text-ink-secondary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={label}
        placeholderTextColor={colors["ink-disabled"]}
        multiline={multiline}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="bg-surface-raised rounded-sm px-3 py-2 text-base text-ink-primary"
        style={[
          { borderWidth: isFocused ? 2 : 1, borderColor: isFocused ? colors.accent : colors["border-hairline"] },
          multiline ? { minHeight: 96, textAlignVertical: "top" } : null,
        ]}
      />
    </View>
  );
}
