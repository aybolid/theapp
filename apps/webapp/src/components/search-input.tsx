import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@theapp/ui/components/input-group";
import { useDebouncedValue } from "@theapp/ui/hooks/use-debounced-value";
import { Search01Icon, X } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import {
  type ComponentPropsWithoutRef,
  type FC,
  useEffect,
  useState,
} from "react";

export const SearchInput: FC<
  Omit<ComponentPropsWithoutRef<typeof InputGroup>, "defaultValue"> & {
    onDebouncedChange?: (v: string) => void;
    defaultValue?: string;
  }
> = ({ onDebouncedChange = () => null, defaultValue = "", ...props }) => {
  const [value, setValue] = useState(defaultValue);
  const [debouncedValue] = useDebouncedValue(value);

  useEffect(() => {
    if (!value) {
      onDebouncedChange("");
    }
  }, [value]);

  useEffect(() => {
    const trimmed = debouncedValue.trim();
    if (trimmed.length >= 3) {
      onDebouncedChange(trimmed);
    }
  }, [debouncedValue.trim()]);

  return (
    <InputGroup {...props}>
      <InputGroupInput
        placeholder="Type to search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <InputGroupAddon>
        <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
      </InputGroupAddon>
      {value.trim() && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={() => setValue("")}>
            <HugeiconsIcon icon={X} strokeWidth={2} />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
};
