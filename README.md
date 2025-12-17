# Payload Label Popover Plugin
#### Adds a descriptive popover to [Payload](https://payloadcms.com/) field labels (using [React Tiny Popover](https://github.com/alexkatz/react-tiny-popover)).

![image](https://github.com/notchris/payload-label-popover/blob/main/example.png?raw=true)


## Installation

```bash
  yarn add payload-label-popover
  #OR
  npm i payload-label-popover
```

## Basic Usage

Import the plugin and add it to your payload configuration file.

```ts
// Add the plugin to the "plugins" array in your payload config
{
  // ... Rest of payload config
  plugins: [
    labelPopoverPlugin({
      collections: {
        examples: true,
      },
    }),
  ]
}
```

The plugin options are optional and allow you to:

- limit the plugin to a subset of collections (`collections`)
- temporarily disable the UI portion without touching your schema (`disabled`)

```ts
// Enable a popover on a field using the `custom` object
const Examples: CollectionConfig = {
  slug: 'examples',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'text',
      name: 'title',
      label: 'Hello World',
      custom: {
        labelPopover: {
          en: 'This is a test to see if this popover will work and wrap correctly.',
          nl: 'Gebruik me voor korte instructies bij dit veld.',
        },
        showLabelPopover: true,
      },
    },
  ],
}
export default Examples
```

> `labelPopover` supports plain strings or a translation object. Pair it with `showLabelPopover` to opt specific fields into the UI.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.
