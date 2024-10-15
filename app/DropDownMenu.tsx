import React from "react";
import { View, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons or any other icon library

interface DropDownMenuProps {
  items: { label: string; value: string }[];
  selectedValue: string | null;
  onValueChange: (value: string | null) => void;
}

const DropDownMenu: React.FC<DropDownMenuProps> = ({
  items,
  selectedValue,
  onValueChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | null>(selectedValue);

  React.useEffect(() => {
    setValue(selectedValue); // Sync the selected value with the prop
  }, [selectedValue]);

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(val) => {
          setValue(val as unknown as string);
          onValueChange(val as unknown as string);
        }}
        setItems={() => {}}
        placeholder="Select a section..."
        dropDownContainerStyle={styles.dropdownContainer}
        style={styles.dropdown}
        labelStyle={styles.label}
        textStyle={styles.text} // Explicitly define text styles for dropdown items
        containerStyle={styles.containerStyle}
        iconContainerStyle={styles.iconContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginHorizontal: 16,
  },
  dropdown: {
    backgroundColor: "#2c2c2c",
    borderWidth: 0,
    borderRadius: 10,
  },
  dropdownContainer: {
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
  },
  label: {
    color: "#fff",
  },
  text: {
    color: "#fff", // Explicitly set text color to white
  },
  containerStyle: {
    height: 50,
  },
  iconContainer: {
    backgroundColor: "transparent", // Ensure background is transparent
    alignItems: "center", // Center the icon
    justifyContent: "center", // Center the icon
  },
});

export default DropDownMenu;
