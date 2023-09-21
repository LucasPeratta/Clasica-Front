import { useEffect, useState } from "react";
import useAutocomplete from "@mui/base/useAutocomplete";
import CheckIcon from "@mui/icons-material/Check";
import { Root, Label, InputWrapper, StyledTag, Listbox } from "./styles";

interface Props {
  initialValues: IOptions[];
  options: IOptions[];
  label: string;
  updateSelection: (newvalue: IOptions[]) => void;
}

export const Autocomplete = ({
  initialValues,
  options,
  label,
  updateSelection,
}: Props) => {
  const [selectedValue, setSelectedValue] = useState<IOptions[]>(initialValues);

  console.log({ initialValues });

  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    id: "customized-hook-demo",
    value: selectedValue, // Utiliza un valor controlado
    multiple: true,
    options,
    getOptionLabel: (option) => option.title,
    isOptionEqualToValue: (option, value) => option.id === value.id,
    onChange: (_, newValue) => {
      setSelectedValue(newValue);
    },
  });

  useEffect(() => {
    updateSelection(selectedValue);
  }, [selectedValue, updateSelection]);

  return (
    <Root>
      <div {...getRootProps()}>
        <Label {...getInputLabelProps()}>{label}:</Label>
        <InputWrapper ref={setAnchorEl} className={focused ? "focused" : ""}>
          {selectedValue.map((option, index) => (
            <StyledTag label={option.title} {...getTagProps({ index })} />
          ))}
          <input {...getInputProps()} />
        </InputWrapper>
      </div>
      {groupedOptions.length > 0 ? (
        <Listbox {...getListboxProps()}>
          {(groupedOptions as typeof options).map((option, index) => (
            <li {...getOptionProps({ option, index })} key={option.id}>
              <span>{option.title}</span>
              <CheckIcon fontSize="small" />
            </li>
          ))}
        </Listbox>
      ) : null}
    </Root>
  );
};

export interface IOptions {
  id: string;
  title: string;
}
