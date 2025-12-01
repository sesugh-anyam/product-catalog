import { useState } from 'react'
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Input,
  Card,
  Text,
} from '@chakra-ui/react'
import { Field } from '@/components/ui/field'
import { Alert } from '@/components/ui/alert'
import { LOW_STOCK_THRESHOLD } from '@product-catalog/shared'

export const SettingsPage = () => {
  const [threshold, setThreshold] = useState(LOW_STOCK_THRESHOLD)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <VStack gap={6} align="stretch" maxW="2xl">
      <Box>
        <Heading size="xl">Settings</Heading>
        <Text color="fg.muted">Configure your inventory alerts and preferences</Text>
      </Box>

      {saved && (
        <Alert status="success" variant="subtle">
          Settings saved successfully!
        </Alert>
      )}

      <Card.Root>
        <Card.Header>
          <Heading size="md">Inventory Alerts</Heading>
        </Card.Header>
        <Card.Body>
          <VStack gap={4} align="stretch">
            <Field label="Low Stock Threshold">
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                min={0}
                max={1000}
              />
              <Text fontSize="sm" color="fg.muted" mt={1}>
                Products with stock below this number will be flagged as low stock
              </Text>
            </Field>

            <Box pt={4} borderTopWidth="1px">
              <Text fontSize="sm" color="fg.muted" mb={4}>
                Current threshold: {LOW_STOCK_THRESHOLD} units
              </Text>
              <HStack>
                <Button
                  onClick={handleSave}
                  colorScheme="blue"
                  disabled={threshold === LOW_STOCK_THRESHOLD}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setThreshold(LOW_STOCK_THRESHOLD)}
                  disabled={threshold === LOW_STOCK_THRESHOLD}
                >
                  Reset
                </Button>
              </HStack>
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="md">Notification Preferences</Heading>
        </Card.Header>
        <Card.Body>
          <VStack gap={4} align="stretch">
            <Text fontSize="sm" color="fg.muted">
              Real-time notifications are automatically enabled for:
            </Text>
            <VStack gap={2} align="start" pl={4}>
              <Text fontSize="sm">• New low stock alerts</Text>
              <Text fontSize="sm">• Stock replenishment confirmations</Text>
              <Text fontSize="sm">• Critical inventory updates</Text>
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  )
}
