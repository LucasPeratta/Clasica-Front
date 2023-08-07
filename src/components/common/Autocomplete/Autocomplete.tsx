import useAutocomplete from "@mui/base/useAutocomplete";
import CheckIcon from "@mui/icons-material/Check";
import { Root, Label, InputWrapper, StyledTag, Listbox } from "./styles";
import { useEffect } from "react";

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
  console.log({ initialValues });
  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    id: "customized-hook-demo",
    defaultValue: initialValues,
    multiple: true,
    options,
    getOptionLabel: (option) => option.title,
    isOptionEqualToValue: (option, value) => option.id === value.id, // Personaliza la comparación
  });

  useEffect(() => {
    console.log({ value });
    updateSelection(value);
  }, [value, updateSelection]);

  return (
    <Root>
      <div {...getRootProps()}>
        <Label {...getInputLabelProps()}>{label}:</Label>
        <InputWrapper ref={setAnchorEl} className={focused ? "focused" : ""}>
          {value.map((option, index) => (
            <StyledTag label={option.title} {...getTagProps({ index })} />
          ))}
          <input {...getInputProps()} />
        </InputWrapper>
      </div>
      {groupedOptions.length > 0 ? (
        <Listbox {...getListboxProps()}>
          {(groupedOptions as typeof options).map((option, index) => (
            <li {...getOptionProps({ option, index })}>
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
