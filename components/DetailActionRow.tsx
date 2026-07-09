import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";

type DetailActionRowProps = {
  isFavorite: boolean;
};

export function DetailActionRow({ isFavorite }: DetailActionRowProps) {
  const actions = [
    {
      key: "copy",
      icon: "content-copy",
      label: "Copy",
      accessibilityLabel: "Copy prompt",
      color: colors["ink-primary"],
    },
    {
      key: "favorite",
      icon: isFavorite ? "star" : "star-border",
      label: "Favorite",
      accessibilityLabel: "Favorite",
      color: isFavorite ? colors.accent : colors["ink-secondary"],
    },
    { key: "edit", icon: "edit", label: "Edit", accessibilityLabel: "Edit prompt", color: colors["ink-primary"] },
    {
      key: "delete",
      icon: "delete",
      label: "Delete",
      accessibilityLabel: "Delete prompt",
      color: colors.danger,
    },
  ] as const;

  return (
    <View className="flex-row items-center justify-between" style={{ padding: spacing["4"] }}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel}
          className="flex-1 items-center justify-center"
          style={{ minHeight: 48, minWidth: 48 }}
        >
          <MaterialIcons name={action.icon} size={24} color={action.color} />
          <Text style={{ color: action.color }} className="mt-1 text-xs">
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
