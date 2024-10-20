import React from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

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
    <View>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={() => {}}
        placeholder="Select a section..."
        onChangeValue={(val) => {
          setValue(val);
          onValueChange(val); // Pass the selected value to the handler
        }}
      />
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 10,
//     marginHorizontal: 16,
//   },
//   dropdown: {
//     backgroundColor: "#2c2c2c",
//     borderWidth: 0,
//     borderRadius: 10,
//   },
//   dropdownContainer: {
//     backgroundColor: "#2c2c2c",
//     borderRadius: 10,
//   },
//   label: {
//     color: "#fff",
//   },
//   text: {
//     color: "#fff",
//   },
//   containerStyle: {
//     height: 50,
//   },
//   iconContainer: {
//     backgroundColor: "transparent",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

export default DropDownMenu;
