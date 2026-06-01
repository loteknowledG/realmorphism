import * as React from "react";



import { RollingPicker } from "./ui/rolling-picker.tsx";

import {

  DOC_TYPE_ENTRIES,

  docTypeIconFile,

  docTypeIconSrc,

  type DocTypeValue,

} from "../lib/doc-type-icon.ts";

import {

  catalogToRollingItems,

  rollingPickerLayoutForMode,

} from "../lib/catalog-to-rolling-items.tsx";



type DocTypeRollingPickerProps = {

  value: DocTypeValue;

  onChange: (value: DocTypeValue) => void;

};



/** Y-axis rolling picker for document types — matches Echo Mirage operator pane icons. */

export function DocTypeRollingPicker({ value, onChange }: DocTypeRollingPickerProps) {

  const items = React.useMemo(

    () =>

      catalogToRollingItems(DOC_TYPE_ENTRIES, {

        mode: "compact",

        renderSlide: (entry) => (

          <img

            src={docTypeIconSrc(entry.value)}

            alt=""

            aria-hidden="true"

            draggable={false}

            data-vscode-icon={docTypeIconFile(entry.value)}

            className="h-3.5 w-3.5 object-contain"

          />

        ),

      }),

    [],

  );



  return (

    <RollingPicker

      items={items}

      value={value}

      onChange={(next) => onChange(next as DocTypeValue)}

      ariaLabel="Document type"

      rollerType="compact"

      viewportClassName="h-7 w-7"

      showSnapHint

      {...rollingPickerLayoutForMode("compact")}

    />

  );

}
