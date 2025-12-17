'use client'

import type { FieldLabelClientProps } from 'payload'
import { getTranslation, type I18nClient } from '@payloadcms/translations'
import { useTranslation } from '@payloadcms/ui'
import { ArrowContainer, Popover } from 'react-tiny-popover'
import type { PopoverState } from 'react-tiny-popover'
import React, { ReactNode, useMemo, useState } from 'react'

type TranslationObject = Record<string, string>

type LabelPopoverCustomConfig = {
  labelPopover?: ReactNode | TranslationObject | string
  showLabelPopover?: boolean
}

type LabelPopoverProps = FieldLabelClientProps & {
  customConfig?: LabelPopoverCustomConfig
  className?: string
}

const ADMIN_CUSTOM_KEY = '__labelPopoverPlugin'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isTranslation = (value: unknown): value is TranslationObject =>
  isRecord(value) && Object.values(value).every(v => typeof v === 'string')

const readAdminCustomConfig = (field?: FieldLabelClientProps['field']): LabelPopoverCustomConfig | null => {
  if (!field) return null

  const { admin } = field as { admin?: { custom?: unknown } }

  if (!admin || typeof admin !== 'object') return null

  const adminCustom = (admin as { custom?: unknown }).custom

  if (!isRecord(adminCustom)) return null

  const config = adminCustom[ADMIN_CUSTOM_KEY]

  if (!isRecord(config)) return null

  const { labelPopover, showLabelPopover } = config as LabelPopoverCustomConfig

  return showLabelPopover && labelPopover
    ? {
        labelPopover,
        showLabelPopover,
      }
    : null
}

const getCustomConfig = (
  field?: FieldLabelClientProps['field'],
  customConfig?: LabelPopoverCustomConfig,
): LabelPopoverCustomConfig => {
  if (customConfig?.showLabelPopover && customConfig.labelPopover) {
    return customConfig
  }

  const adminConfig = readAdminCustomConfig(field)

  if (adminConfig) {
    return adminConfig
  }

  if (!field) {
    return {}
  }

  const { custom } = field as { custom?: unknown }

  if (!isRecord(custom)) {
    return {}
  }

  const { labelPopover, showLabelPopover } = custom as LabelPopoverCustomConfig

  return {
    labelPopover,
    showLabelPopover,
  }
}

const getFieldLabel = (field?: FieldLabelClientProps['field']): FieldLabelClientProps['label'] | undefined => {
  if (!field || typeof field !== 'object') return undefined

  if ('label' in field) {
    return (field as { label?: FieldLabelClientProps['label'] }).label
  }

  return undefined
}

const isFieldRequired = (field?: FieldLabelClientProps['field']): boolean => {
  if (!field || typeof field !== 'object') return false

  if ('required' in field) {
    return Boolean((field as { required?: boolean }).required)
  }

  return false
}

const formatPopoverContent = (
  content: LabelPopoverCustomConfig['labelPopover'],
  i18n: Pick<I18nClient, 'fallbackLanguage' | 'language' | 't'>,
): ReactNode | string => {
  if (!content) return ''

  if (typeof content === 'string') {
    return content
  }

  if (isTranslation(content)) {
    return getTranslation(content, i18n)
  }

  return content
}

export const LabelPopover = (props: LabelPopoverProps) => {
  const { label, required, field, customConfig, className } = props

  const { t, i18n } = useTranslation()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { labelPopover, showLabelPopover } = useMemo(
    () => getCustomConfig(field, customConfig),
    [customConfig, field],
  )

  const popoverContent = useMemo(
    () => formatPopoverContent(labelPopover, i18n),
    [i18n, labelPopover],
  )

  const fieldLabel = getFieldLabel(field)
  const labelContent = label ?? fieldLabel
  const isRequired = typeof required === 'boolean' ? required : isFieldRequired(field)

  if (!labelContent) {
    return null
  }

  const moreInfoLabel =
    (typeof t === 'function' ? (t as (key: string) => string)('general:moreInfo') : undefined) || 'More info'

  const handleMouseEnter = () => setIsPopoverOpen(true)
  const handleMouseLeave = () => setIsPopoverOpen(false)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className={className}>
      <span>
        {getTranslation(labelContent, {
          fallbackLanguage: i18n.fallbackLanguage,
          language: i18n.language,
          t: i18n.t,
        })}
        {isRequired && <span className="required">*</span>}
      </span>
      {showLabelPopover && popoverContent ? (
        <Popover
          isOpen={isPopoverOpen}
          positions={['top', 'right', 'left', 'bottom']}
          padding={10}
          onClickOutside={() => setIsPopoverOpen(false)}
          content={({ position, childRect, popoverRect }: PopoverState) => (
            <ArrowContainer
              position={position}
              childRect={childRect}
              popoverRect={popoverRect}
              arrowColor="var(--color-base-800)"
              arrowSize={10}
              className="popover-arrow-container"
              arrowClassName="popover-arrow"
            >
              <div
                style={{
                  backgroundColor: 'var(--color-base-800)',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  maxWidth: '20rem',
                }}
                onClick={() => setIsPopoverOpen(false)}
              >
                {popoverContent}
              </div>
            </ArrowContainer>
          )}
        >
          <button
            type="button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label={moreInfoLabel}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-help"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </button>
        </Popover>
      ) : null}
    </div>
  )
}
