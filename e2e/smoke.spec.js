import { test, expect } from '@playwright/test'

const CONFIGURATION_URL =
  '/?dbVersion=18&osType=linux&dbType=web&cpuNum=&totalMemory=21&totalMemoryUnit=GB&connectionNum=&hdType=ssd&dbSize=mid_ram'

const generatedConfiguration = (page) =>
  page.getByRole('region', { name: 'Generated configuration' })

test.describe('configuration', () => {
  test('is generated automatically, when form is filled', async ({ page }) => {
    await page.goto('/')
    await expect(generatedConfiguration(page)).toHaveCount(0)
    const historyLength = await page.evaluate(() => window.history.length)

    await page.locator('#TotalMemoryId').fill('16')

    await expect(generatedConfiguration(page)).toContainText('shared_buffers = 4GB')
    await expect(page).toHaveURL(/totalMemory=16/)
    // url is replaced, so typing does not add browser history entries
    expect(await page.evaluate(() => window.history.length)).toEqual(historyLength)
  })

  test('keeps last valid configuration, while input is invalid', async ({ page }) => {
    await page.goto(CONFIGURATION_URL)
    const connections = page.getByLabel('Number of Connections')

    await connections.fill('5')
    await connections.blur()

    await expect(page.getByText('Must be greater than or equal to 20')).toBeVisible()
    await expect(connections).toHaveAttribute('aria-invalid', 'true')
    await expect(generatedConfiguration(page)).toContainText('max_connections = 200')
  })

  test('switches format with keyboard', async ({ page }) => {
    await page.goto(CONFIGURATION_URL)

    await page.getByRole('tab', { name: 'postgresql.conf' }).focus()
    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('tab', { name: 'ALTER SYSTEM' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(generatedConfiguration(page)).toContainText(
      "ALTER SYSTEM SET shared_buffers = '5376MB';"
    )
  })
})

test.describe('copy', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  const clipboardText = (page) => page.evaluate(() => navigator.clipboard.readText())

  test('copies configuration with warnings', async ({ page }) => {
    await page.goto(CONFIGURATION_URL)

    // button name changes with its label, so it is found by expected name in each state
    await page.getByRole('button', { name: 'Copy configuration' }).click()

    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible()
    const text = await clipboardText(page)
    expect(text.startsWith('# WARNING (may prevent startup)')).toEqual(true)
    expect(text).toContain('shared_buffers = 5376MB')
    // label is restored after a while
    await expect(page.getByRole('button', { name: 'Copy configuration' })).toBeVisible()
  })

  test('copies configuration without warnings, when they are excluded', async ({ page }) => {
    await page.goto(CONFIGURATION_URL)

    await page.getByLabel('Include warnings as comments when copying').uncheck()
    await page.getByRole('button', { name: 'Copy', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible()
    const text = await clipboardText(page)
    expect(text.startsWith('# DB Version: 18')).toEqual(true)
    expect(text).not.toContain('WARNING')
  })
})

test.describe('help text', () => {
  test('opens with button and closes with Escape', async ({ page }) => {
    await page.goto('/')
    const button = page.locator('#tooltipdbTypeIdButton')
    const helpText = page.locator('#tooltipdbTypeIdContent')

    await expect(helpText).toBeHidden()
    await button.click()

    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(helpText).toBeVisible()
    await expect(helpText).toContainText('Data warehouse: bulk loads, large reporting queries')

    await page.keyboard.press('Escape')

    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(helpText).toBeHidden()
  })

  test('describes inputs for screen readers', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByLabel('Number of CPUs')).toHaveAccessibleDescription(
      /Number of CPUs, which PostgreSQL can use/
    )
  })
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const colorScheme of ['light', 'dark']) {
    test(`has no horizontal page overflow in ${colorScheme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(CONFIGURATION_URL)
      await page.locator('#tooltipconnectionNumIdButton').click()
      await expect(generatedConfiguration(page)).toBeVisible()

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      )
      expect(overflow).toEqual(0)
    })
  }
})
