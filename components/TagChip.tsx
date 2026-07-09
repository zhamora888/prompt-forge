import { Pressable, Text, View } from "react-native";

type TagChipProps = {
  label: string;
  onRemove?: () => void;
};

export function TagChip({ label, onRemove }: TagChipProps) {
  return (
    <View className="bg-surface-base border-border-hairline flex-row items-center rounded-sm border px-2 py-1">
      <Text className="text-ink-secondary text-sm">{label}</Text>
      {onRemove && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove tag ${label}`}
          onPress={onRemove}
          className="ml-1 h-12 w-12 items-center justify-center"
        >
          <Text className="text-ink-secondary text-sm">×</Text>
        </Pressable>
      )}
    </View>
  );
}
