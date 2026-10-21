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

  test('is restored by browser back, as url is its only source', async ({ page }) => {
    await page.goto(CONFIGURATION_URL)
    await page.getByRole('button', { name: 'Generate' }).click()
    await page.locator('#TotalMemoryId').fill('64')
    await page.getByRole('button', { name: 'Generate' }).click()
    await expect(generatedConfiguration(page)).toContainText('shared_buffers = 16GB')

    await page.goBack()

    await expect(page.locator('#TotalMemoryId')).toHaveValue('21')
    await expect(generatedConfiguration(page)).toContainText('shared_buffers = 5376MB')
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

  test('requires at least 512 MB of memory', async ({ page }) => {
    await page.goto(CONFIGURATION_URL)
    const memory = page.locator('#TotalMemoryId')

    await memory.fill('100')
    await page.locator('select[name="totalMemoryUnit"]').selectOption('MB')
    await memory.blur()

    await expect(page.getByText('Must be greater than or equal to 512 MB')).toBeVisible()
    await expect(generatedConfiguration(page)).toContainText('shared_buffers = 5376MB')
  })

  test('switches format with keyboard', async ({ page }) => {
    await page.goto(CONFIGURATION_URL)
    const configTab = page.getByRole('tab', { name: 'postgresql.conf' })

    // first tab is selected and reachable by keyboard
    await expect(configTab).toHaveAttribute('aria-selected', 'true')
    await expect(configTab).toHaveAttribute('tabindex', '0')

    await configTab.focus()
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

test.describe('highlighting', () => {
  for (const colorScheme of ['light', 'dark']) {
    test(`meets WCAG AA contrast in ${colorScheme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(CONFIGURATION_URL)

      for (const tab of ['postgresql.conf', 'ALTER SYSTEM']) {
        await page.getByRole('tab', { name: tab }).click()

        const contrasts = await generatedConfiguration(page).evaluate((code) => {
          const rgb = (color) =>
            color
              .match(/\d+(\.\d+)?/g)
              .slice(0, 3)
              .map(Number)
          const luminance = (color) => {
            const [r, g, b] = rgb(color)
              .map((value) => value / 255)
              .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
          }
          const ratio = (a, b) => {
            const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
            return (light + 0.05) / (dark + 0.05)
          }
          const background = getComputedStyle(code).backgroundColor

          return [...code.querySelectorAll('[class^="configuration-code__"]')].map((token) => ({
            token: token.className,
            ratio: ratio(getComputedStyle(token).color, background)
          }))
        })

        expect(contrasts.length).toBeGreaterThan(0)
        for (const { token, ratio } of contrasts) {
          expect(ratio, `${tab} ${token}`).toBeGreaterThanOrEqual(4.5)
        }
      }
    })
  }
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
    await expect(helpText).toContainText(
      'Data warehouse: few long analytical queries over large amounts of data, bulk data loads'
    )

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

test.describe('theme', () => {
  test('switches and is remembered after reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    const html = page.locator('html')
    const toggle = page.locator('#theme-toggle')

    await page.locator('.toggle-wrapper').click()

    await expect(html).toHaveClass('dark')
    await expect(toggle).toBeChecked()

    await page.reload()

    await expect(html).toHaveClass('dark')
    await expect(toggle).toBeChecked()
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

test.describe('prerender', () => {
  test('pages are served with rendered content', async ({ request }) => {
    const home = await (await request.get('/')).text()
    expect(home).toContain('Parameters of your system')
    expect(home).toContain('SaaS backends')

    const about = await (await request.get('/about')).text()
    expect(about).toContain('Before applying the configuration')
  })

  test.describe('without javascript', () => {
    test.use({ javaScriptEnabled: false })

    test('shows form and description', async ({ page }) => {
      await page.goto('/')

      await expect(page.getByRole('heading', { name: 'Parameters of your system' })).toBeVisible()
      await expect(page.getByLabel('Number of CPUs')).toBeVisible()
      await expect(page.getByText('SaaS backends')).toBeVisible()
    })
  })

  test('shows configuration from url params over prerendered page', async ({ page }) => {
    await page.goto(CONFIGURATION_URL)

    await expect(page.locator('#TotalMemoryId')).toHaveValue('21')
    await expect(page.locator('#TotalMemoryId')).toBeFocused()
    await expect(generatedConfiguration(page)).toContainText('shared_buffers = 5376MB')
    await expect(page.getByRole('heading', { name: 'Choosing "DB Type"' })).toHaveCount(0)
  })
})
