"use client";

import { useState, useEffect } from "react";
import ReactSelect, { MultiValue, ActionMeta } from "react-select";

interface SelectProps {
  value?: { value: string; label: string }[];
  onChange: (value: MultiValue<{ value: string; label: string }>) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

const ReactSelectUI: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  disabled,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="z-[100]">
      <div className="mt-2">
        {isClient && (
          <ReactSelect
            isDisabled={disabled}
            value={value}
            onChange={(
              newValue: MultiValue<{ value: string; label: string }>,
              actionMeta: ActionMeta<{ value: string; label: string }>
            ) => {
              onChange(newValue);
            }}
            isMulti
            options={options}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            classNames={{
              control: () => "text-sm",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ReactSelectUI;
