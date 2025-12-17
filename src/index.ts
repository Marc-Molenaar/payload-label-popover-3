import type { CollectionConfig, CollectionSlug, Config, Field } from 'payload'

const LABEL_COMPONENT_PATH = 'payload-label-popover/client#LabelPopover'
const LABEL_POPOVER_ADMIN_KEY = '__labelPopoverPlugin'

export type LabelPopoverPluginConfig = {
  /**
   * Limit the plugin to specific collections.
   * Provide collection slugs with a value of true.
   */
  collections?: Partial<Record<CollectionSlug, true>>
  /**
   * Skip applying the plugin without removing schema changes.
   */
  disabled?: boolean
}

type LabelPopoverCustomConfig = {
  labelPopover?: unknown
  showLabelPopover?: boolean
}

const getLabelPopoverConfig = (field: Field): LabelPopoverCustomConfig | null => {
  if (!('custom' in field) || typeof field.custom !== 'object' || field.custom === null) {
    return null
  }

  const { labelPopover, showLabelPopover } = field.custom as LabelPopoverCustomConfig

  return showLabelPopover && labelPopover
    ? {
        labelPopover,
        showLabelPopover,
      }
    : null
}

const storeAdminConfig = (field: Field, config: LabelPopoverCustomConfig): void => {
  field.admin ??= {}
  const custom = (field.admin.custom || {}) as Record<string, unknown>
  custom[LABEL_POPOVER_ADMIN_KEY] = config
  field.admin.custom = custom
}

const applyPopoverToFields = (fields?: Field[]): void => {
  if (!fields) return

  fields.forEach(field => {
    const popoverConfig = getLabelPopoverConfig(field)

    if (popoverConfig) {
      storeAdminConfig(field, popoverConfig)
      field.admin ??= {}
      const components = (field.admin.components || {}) as typeof field.admin.components & {
        Label?: string
      }
      components.Label = LABEL_COMPONENT_PATH
      field.admin.components = components
    }

    if ('fields' in field) {
      applyPopoverToFields(field.fields)
    }

    if ('blocks' in field && Array.isArray(field.blocks)) {
      field.blocks.forEach(block => applyPopoverToFields(block.fields))
    }

    if ('tabs' in field && Array.isArray(field.tabs)) {
      field.tabs.forEach(tab => applyPopoverToFields(tab.fields))
    }
  })
}

const shouldProcessCollection = (
  slug: CollectionConfig['slug'],
  enabledCollections?: LabelPopoverPluginConfig['collections'],
): boolean => {
  if (!enabledCollections) {
    return true
  }

  return Boolean(slug && enabledCollections[slug])
}

export const labelPopoverPlugin =
  (pluginOptions: LabelPopoverPluginConfig = {}) =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    if (pluginOptions.disabled || !config.collections?.length) {
      return config
    }

    config.collections.forEach(collection => {
      if (shouldProcessCollection(collection.slug, pluginOptions.collections)) {
        applyPopoverToFields(collection.fields)
      }
    })

    return config
  }
