import { Field as ChakraField } from '@chakra-ui/react'
import { forwardRef } from 'react'

interface FieldProps {
  label?: string
  invalid?: boolean
  errorText?: string
  children: React.ReactNode
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  ({ label, invalid, errorText, children }, ref) => {
    return (
      <ChakraField.Root ref={ref} invalid={invalid}>
        {label && <ChakraField.Label>{label}</ChakraField.Label>}
        {children}
        {errorText && (
          <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>
        )}
      </ChakraField.Root>
    )
  }
)

Field.displayName = 'Field'
