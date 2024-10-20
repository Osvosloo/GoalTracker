import React from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet } from "react-native";

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

  // Sync the selected value with the prop
  React.useEffect(() => {
    setValue(selectedValue);
  }, [selectedValue]);

  // Add "All Sections" option to the items
  const allSectionsItem = { label: "All Sections", value: "all" };
  const dropdownItems = [allSectionsItem, ...items];

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={value}
        items={dropdownItems}
        setOpen={setOpen}
        setValue={setValue}
        setItems={() => {}}
        placeholder="Select a section..."
        onChangeValue={(val) => {
          setValue(val);
          onValueChange(val); // Pass the selected value to the handler
        }}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        labelStyle={styles.label}
        textStyle={styles.text}
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
    color: "#fff",
  },
  containerStyle: {
    height: 50,
  },
  iconContainer: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DropDownMenu;
