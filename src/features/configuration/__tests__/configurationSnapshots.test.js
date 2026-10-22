import { FORM_DEFAULTS } from '../configurationParams'
import { isValid } from '../validation'
import { generateConfiguration } from './generateConfiguration'

// Generated configuration (copied text with warnings) for representative inputs.
// Files in __snapshots__/configurations show every change of generated settings and texts
// in review. After a deliberate change, update them with "yarn test -u" and review the diff
const CASES = [
  // each PostgreSQL version
  {
    name: 'pg19-linux-oltp-64gb-32cpu-nvme',
    values: { dbVersion: '19', dbType: 'oltp', totalMemory: '64', cpuNum: '32', hdType: 'nvme' }
  },
  {
    name: 'pg19-mac-web-32gb-64cpu-ssd',
    values: { dbVersion: '19', osType: 'mac', totalMemory: '32', cpuNum: '64' }
  },
  {
    name: 'pg18-linux-web-16gb-8cpu-ssd',
    values: { dbVersion: '18', totalMemory: '16', cpuNum: '8' }
  },
  {
    name: 'pg17-linux-dw-256gb-64cpu-san-greater-ram',
    values: {
      dbVersion: '17',
      dbType: 'dw',
      totalMemory: '256',
      cpuNum: '64',
      hdType: 'san',
      dbSize: 'greater_ram'
    }
  },
  {
    name: 'pg16-linux-mixed-32gb-16cpu-ssd',
    values: { dbVersion: '16', dbType: 'mixed', totalMemory: '32', cpuNum: '16' }
  },
  {
    name: 'pg15-windows-web-8gb-4cpu-ssd',
    values: { dbVersion: '15', osType: 'windows', totalMemory: '8', cpuNum: '4' }
  },
  {
    name: 'pg14-linux-desktop-4gb-2cpu-hdd-less-ram',
    values: {
      dbVersion: '14',
      dbType: 'desktop',
      totalMemory: '4',
      cpuNum: '2',
      hdType: 'hdd',
      dbSize: 'less_ram'
    }
  },
  {
    name: 'pg13-linux-oltp-16gb-8cpu-ssd-1000-connections',
    values: {
      dbVersion: '13',
      dbType: 'oltp',
      totalMemory: '16',
      cpuNum: '8',
      connectionNum: '1000'
    }
  },
  {
    name: 'pg12-linux-web-4gb-2cpu-san-2000-connections',
    values: {
      dbVersion: '12',
      totalMemory: '4',
      cpuNum: '2',
      hdType: 'san',
      connectionNum: '2000'
    }
  },
  {
    name: 'pg11-linux-dw-64gb-32cpu-hdd',
    values: { dbVersion: '11', dbType: 'dw', totalMemory: '64', cpuNum: '32', hdType: 'hdd' }
  },
  {
    name: 'pg10-linux-web-2gb-ssd',
    values: { dbVersion: '10', totalMemory: '2' }
  },
  // operating systems, storage and data sizes
  {
    name: 'pg18-windows-dw-128gb-32cpu-nvme-less-ram',
    values: {
      osType: 'windows',
      dbType: 'dw',
      totalMemory: '128',
      cpuNum: '32',
      hdType: 'nvme',
      dbSize: 'less_ram'
    }
  },
  {
    name: 'pg17-windows-oltp-256gb-64cpu-ssd',
    values: { dbVersion: '17', osType: 'windows', dbType: 'oltp', totalMemory: '256', cpuNum: '64' }
  },
  {
    name: 'pg18-mac-desktop-16gb-8cpu-nvme',
    values: { osType: 'mac', dbType: 'desktop', totalMemory: '16', cpuNum: '8', hdType: 'nvme' }
  },
  {
    name: 'pg18-linux-dw-64gb-16cpu-ssd',
    values: { dbType: 'dw', totalMemory: '64', cpuNum: '16' }
  },
  // edge cases
  {
    name: 'pg18-linux-mixed-512mb-2cpu-hdd',
    values: {
      dbType: 'mixed',
      totalMemory: '512',
      totalMemoryUnit: 'MB',
      cpuNum: '2',
      hdType: 'hdd'
    }
  },
  {
    name: 'pg18-linux-mixed-12gb-2221cpu-ssd',
    values: { dbType: 'mixed', totalMemory: '12', cpuNum: '2221' }
  },
  {
    name: 'pg19-linux-web-16gb-64cpu-ssd-less-ram-1000-connections',
    values: {
      dbVersion: '19',
      totalMemory: '16',
      cpuNum: '64',
      connectionNum: '1000',
      dbSize: 'less_ram'
    }
  },
  {
    name: 'pg18-linux-web-4tb-2000cpu-nvme-260000-connections',
    values: {
      totalMemory: '4',
      totalMemoryUnit: 'TB',
      cpuNum: '2000',
      hdType: 'nvme',
      connectionNum: '260000'
    }
  },
  // ALTER SYSTEM format
  {
    name: 'pg18-linux-web-21gb-ssd',
    values: { totalMemory: '21' },
    isAlterSystem: true
  }
]

describe('generated configuration', () => {
  it.each(CASES)('$name', async ({ name, values, isAlterSystem = false }) => {
    const formValues = { ...FORM_DEFAULTS, ...values }
    // cases are inputs, which form accepts
    expect(isValid(formValues)).toEqual(true)

    const { copyText } = generateConfiguration(formValues, { isAlterSystem })

    await expect(`${copyText}\n`).toMatchFileSnapshot(
      `./__snapshots__/configurations/${name}.${isAlterSystem ? 'sql' : 'conf'}`
    )
  })
})
