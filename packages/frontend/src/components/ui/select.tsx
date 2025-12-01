import { forwardRef, useMemo } from 'react'
import { Select as ChakraSelect, createListCollection } from '@chakra-ui/react'

interface SelectProps {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children?: React.ReactNode
  colorScheme?: 'purple' | 'blue' | 'teal' | 'green' | 'red'
  disabled?: boolean
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ placeholder, value, onChange, children, colorScheme = 'blue', disabled, ...rest }, ref) => {
    
    const options = useMemo(() => {
      if (!children) return []
      
      const optionElements = Array.isArray(children) ? children : [children]
      return optionElements
        .filter((child: any) => {
          return (child?.type === 'option' || child?.props) && 
                 child.props?.value !== undefined
        })
        .map((child: any) => ({
          label: typeof child.props.children === 'string' ? child.props.children : String(child.props.children),
          value: String(child.props.value)
        }))
    }, [children])

    const collection = useMemo(() => createListCollection({ items: options }), [options])
    
    const selectValue = value !== undefined ? (value && value !== '' ? [value] : []) : undefined
    
    return (
      <ChakraSelect.Root
        ref={ref}
        collection={collection}
        value={selectValue}
        onValueChange={(details) => {
          const selectedValue = details.value.length > 0 ? details.value[0] : ''
          
          if (onChange) {
            const mockEvent = {
              target: { 
                value: selectedValue,
                name: (rest as any).name
              }
            } as React.ChangeEvent<HTMLSelectElement>
            
            onChange(mockEvent)
          }
          
          if ((rest as any).onBlur) {
            (rest as any).onBlur({
              target: { 
                value: selectedValue,
                name: (rest as any).name
              }
            })
          }
        }}
        disabled={disabled}
        colorPalette={colorScheme}
        positioning={{ sameWidth: true, strategy: 'absolute' }}
      >
        <ChakraSelect.Trigger>
          <ChakraSelect.ValueText placeholder={placeholder} />
          <ChakraSelect.Indicator />
        </ChakraSelect.Trigger>
        <ChakraSelect.Positioner>
          <ChakraSelect.Content 
              zIndex={1500}
              minW="fit-content"
            >
              {options.map((option) => (
              <ChakraSelect.Item key={option.value} item={option}>
                <ChakraSelect.ItemText>{option.label}</ChakraSelect.ItemText>
                <ChakraSelect.ItemIndicator />
              </ChakraSelect.Item>
            ))}
          </ChakraSelect.Content>
        </ChakraSelect.Positioner>
      </ChakraSelect.Root>
    )
  }
)

Select.displayName = 'Select'
