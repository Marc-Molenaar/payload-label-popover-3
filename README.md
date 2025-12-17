# Payload Label Popover Plugin
#### Adds an accessible popover to [Payload](https://payloadcms.com/) field labels with [React Tiny Popover](https://github.com/alexkatz/react-tiny-popover).

![image](https://github.com/notchris/payload-label-popover/blob/main/example.png?raw=true)

## Requirements
- Payload `3.0.0` or newer (uses the v3 plugin + client component API).

## Installation

```bash
yarn add payload-label-popover-v3
# or
npm install payload-label-popover-v3
```

## Setup

Register the plugin inside your Payload config. When enabled the plugin traverses every field
(`fields`, `blocks`, `tabs`, etc.) and automatically swaps the label component whenever a field opts in.

```ts
import { labelPopoverPlugin } from 'payload-label-popover'

export default buildConfig({
  // …other config
  plugins: [
    labelPopoverPlugin(),
  ],
})
```

### Plugin options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `collections` | `Partial<Record<CollectionSlug, true>>` | `undefined` | Limit the plugin to specific collections. If omitted, every collection is processed. |
| `disabled` | `boolean` | `false` | Skip applying the admin UI changes without touching your schema. Useful for temporary opt-outs. |

## Enable a popover on a field

Opt-in on a per-field basis through the `custom` object. A field only receives the popover when both `showLabelPopover`
and `labelPopover` are provided. The plugin reads the same config no matter how deep the field is nested.

```ts
import type { CollectionConfig } from 'payload'

const Examples: CollectionConfig = {
  slug: 'examples',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'text',
      name: 'title',
      label: 'Title',
      custom: {
        showLabelPopover: true,
        labelPopover: 'This popover uses Payload translations. Keep instructions short and scannable.',
      },
    },
  ],
}

export default Examples
```

`labelPopover` accepts either a plain string or a translation object (`{ [locale]: string }`). The component respects the
active admin language automatically.

## Client component export

The plugin registers its own label component (`payload-label-popover/client#LabelPopover`). If you ever need to mount it
manually (for example inside a custom admin route), you can import it yourself:

```tsx
'use client'

import { LabelPopover } from 'payload-label-popover/client'

export const CustomLabel = () => (
  <LabelPopover
    label="Shipping instructions"
    customConfig={{
      showLabelPopover: true,
      labelPopover: 'Packages must go out within 48 hours.',
    }}
  />
)
```

When used manually you may pass any React node in `customConfig.labelPopover`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
