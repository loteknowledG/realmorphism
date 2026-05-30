import * as React from "react";

import { RollingPicker, type RollingPickerItem } from "./ui/rolling-picker.tsx";
import {
  DOC_TYPE_ENTRIES,
  docTypeIconFile,
  docTypeIconSrc,
  type DocTypeValue,
} from "../lib/doc-type-icon.ts";

type DocTypeRollingPickerProps = {
  value: DocTypeValue;
  onChange: (value: DocTypeValue) => void;
};

function buildDocTypeItems(): RollingPickerItem[] {
  return DOC_TYPE_ENTRIES.map((entry) => ({
    value: entry.value,
    label: entry.label,
    slide: (
      <img
        src={docTypeIconSrc(entry.value)}
        alt=""
        aria-hidden="true"
        draggable={false}
        data-vscode-icon={docTypeIconFile(entry.value)}
        className="h-3.5 w-3.5 object-contain"
      />
    ),
  }));
}

/** Y-axis rolling picker for document types — matches Echo Mirage operator pane icons. */
export function DocTypeRollingPicker({ value, onChange }: DocTypeRollingPickerProps) {
  const items = React.useMemo(() => buildDocTypeItems(), []);

  return (
    <RollingPicker
      items={items}
      value={value}
      onChange={(next) => onChange(next as DocTypeValue)}
      ariaLabel="Document type"
      viewportClassName="h-7 w-7"
      showTextWhileScrolling
      showSnapHint
    />
  );
}
