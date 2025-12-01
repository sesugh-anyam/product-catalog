import { ReactNode } from 'react'
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from '@chakra-ui/react'
import { Button, HStack } from '@chakra-ui/react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmBg: 'red.500',
          confirmHoverBg: 'red.600',
          confirmColor: 'white',
        }
      case 'warning':
        return {
          confirmBg: 'orange.500',
          confirmHoverBg: 'orange.600',
          confirmColor: 'white',
        }
      case 'info':
        return {
          confirmBg: 'blue.500',
          confirmHoverBg: 'blue.600',
          confirmColor: 'white',
        }
      default:
        return {
          confirmBg: 'red.500',
          confirmHoverBg: 'red.600',
          confirmColor: 'white',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <DialogRoot 
      open={isOpen} 
      onOpenChange={(e) => !isLoading && e.open === false && onClose()} 
      placement="center" 
      modal
      size={{ base: 'sm', md: 'md' }}
    >
      <DialogBackdrop 
        bg="blackAlpha.600" 
        _dark={{ bg: 'blackAlpha.800' }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={1400}
        display="flex"
        alignItems="center"
        justifyContent="center"
      />
      <DialogContent
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={1401}
        borderRadius="xl"
        boxShadow="2xl"
        maxW={{ base: 'calc(100vw - 32px)', sm: '384px', md: '448px' }}
        w="full"
        maxH="90vh"
        overflowY="auto"
      >
        <DialogHeader>
          <DialogTitle 
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight="bold"
            color="fg.default"
          >
            {title}
          </DialogTitle>
          {!isLoading && <DialogCloseTrigger />}
        </DialogHeader>

        <DialogBody>
          {typeof message === 'string' ? (
            <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--chakra-colors-fg-muted)' }}>
              {message}
            </p>
          ) : (
            message
          )}
        </DialogBody>

        <DialogFooter>
          <HStack gap={3} width="full" justifyContent="flex-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              size={{ base: 'md', md: 'lg' }}
              minW={{ base: '80px', md: '100px' }}
            >
              {cancelText}
            </Button>
            <Button
              bg={styles.confirmBg}
              color={styles.confirmColor}
              _hover={{ bg: styles.confirmHoverBg }}
              onClick={() => {
                onConfirm()
                onClose()
              }}
              disabled={isLoading}
              size={{ base: 'md', md: 'lg' }}
              minW={{ base: '80px', md: '100px' }}
            >
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
