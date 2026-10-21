import {
  formatMemory,
  formatSettingValue,
  groupWarnings,
  hardwareText,
  settingsText,
  warningsText,
  configurationText
} from '../configurationText'
import {
  normalizeConfiguration,
  selectHardwareConfiguration,
  selectSettings,
  selectWarningInfoMessages,
  selectRestartRequiredSettings
} from '../configurationSlice'

const HARDWARE = {
  dbVersion: 18,
  osType: 'linux',
  dbType: 'web',
  totalMemory: 16,
  totalMemoryUnit: 'GB',
  cpuNum: null,
  connectionNum: null,
  maxConnections: 200,
  hdType: 'ssd',
  dbSize: 'mid_ram'
}

const STARTUP_WARNING = {
  level: 'startup',
  text: ['first line', 'second line'],
  code: 'SELECT 1;'
}
const MEMORY_WARNING = { level: 'memory', text: ['memory warning'] }
const NOTE_WARNING = { level: 'note', text: ['note warning'] }

// configuration text for form values, built with the same selectors as the view
const generate = (values, { isAlterSystem = false, includeWarnings = true } = {}) => {
  const state = { configuration: normalizeConfiguration(values) }
  return configurationText({
    hardware: selectHardwareConfiguration(state),
    settings: selectSettings(state),
    warnings: selectWarningInfoMessages(state),
    restartRequiredSettings: selectRestartRequiredSettings(state),
    isAlterSystem,
    includeWarnings
  })
}

describe('formatMemory', () => {
  it('uses the largest unit without loss of resolution', () => {
    expect(formatMemory(4194304)).toEqual('4GB')
    expect(formatMemory(5505024)).toEqual('5376MB')
    expect(formatMemory(8000)).toEqual('8000kB')
  })
})

describe('formatSettingValue', () => {
  it('formats only memory settings', () => {
    expect(formatSettingValue({ key: 'work_mem', value: 25600, isMemory: true })).toEqual('25MB')
    expect(formatSettingValue({ key: 'max_connections', value: 1024 })).toEqual('1024')
    expect(formatSettingValue({ key: 'random_page_cost', value: 1.1 })).toEqual('1.1')
  })
})

describe('groupWarnings', () => {
  it('groups warnings by level in fixed order and omits empty groups', () => {
    const groups = groupWarnings([NOTE_WARNING, STARTUP_WARNING])
    expect(groups.map((group) => group.level)).toEqual(['startup', 'note'])
    expect(groups[0].title).toEqual('May prevent startup')
    expect(groups[0].warnings).toEqual([STARTUP_WARNING])
  })

  it('returns no groups without warnings', () => {
    expect(groupWarnings([])).toEqual([])
  })
})

describe('hardwareText', () => {
  it('shows provided parameters with readable labels', () => {
    expect(hardwareText(HARDWARE)).toEqual(
      [
        '# DB Version: 18',
        '# OS Type: Linux',
        '# DB Type: Web application',
        '# Total Memory (RAM): 16 GB',
        '# Connections num: 200 (not provided, assumed)',
        '# Data Storage: SSD storage',
        '# Total Data Size: 1x - 3x RAM'
      ].join('\n')
    )
  })

  it('shows provided number of connections and CPUs as SQL comments', () => {
    const text = hardwareText(
      { ...HARDWARE, cpuNum: 8, connectionNum: 300 },
      { isAlterSystem: true }
    )
    expect(text).toContain('-- CPUs num: 8')
    expect(text).toContain('-- Connections num: 300\n')
    expect(text).not.toContain('#')
  })
})

describe('settingsText', () => {
  const settings = [
    { key: 'max_connections', value: 200 },
    { key: 'work_mem', value: 25600, isMemory: true },
    { key: 'max_wal_size', value: 4194304, isMemory: true }
  ]

  it('aligns notes for restart and disk space', () => {
    expect(settingsText(settings, { restartRequiredSettings: ['max_connections'] })).toEqual(
      [
        'max_connections = 200 # restart required',
        'work_mem = 25MB',
        'max_wal_size = 4GB    # needs free disk space'
      ].join('\n')
    )
  })

  it('generates ALTER SYSTEM commands', () => {
    expect(
      settingsText(settings, { isAlterSystem: true, restartRequiredSettings: ['max_connections'] })
    ).toEqual(
      [
        "ALTER SYSTEM SET max_connections = '200'; -- restart required",
        "ALTER SYSTEM SET work_mem = '25MB';",
        "ALTER SYSTEM SET max_wal_size = '4GB';    -- needs free disk space"
      ].join('\n')
    )
  })
})

describe('warningsText', () => {
  it('groups warnings with titles and separators', () => {
    expect(warningsText([NOTE_WARNING, STARTUP_WARNING, MEMORY_WARNING])).toEqual(
      [
        '# WARNING (may prevent startup)',
        '# first line',
        '# second line',
        '# SELECT 1;',
        '#',
        '# WARNING (memory risk)',
        '# memory warning',
        '#',
        '# NOTE',
        '# note warning'
      ].join('\n')
    )
  })

  it('separates warnings of the same level', () => {
    expect(warningsText([NOTE_WARNING, NOTE_WARNING], { isAlterSystem: true })).toEqual(
      ['-- NOTE', '-- note warning', '--', '-- note warning'].join('\n')
    )
  })
})

describe('configurationText', () => {
  const settings = [{ key: 'max_connections', value: 200 }]

  it('adds warnings only to copied text', () => {
    const { text, copyText } = configurationText({
      hardware: HARDWARE,
      settings,
      warnings: [MEMORY_WARNING]
    })
    expect(text.startsWith('# DB Version: 18')).toEqual(true)
    expect(copyText).toEqual(`# WARNING (memory risk)\n# memory warning\n\n${text}`)
  })

  it('copies text without warnings, when they are excluded', () => {
    const { text, copyText } = configurationText({
      hardware: HARDWARE,
      settings,
      warnings: [MEMORY_WARNING],
      includeWarnings: false
    })
    expect(copyText).toEqual(text)
  })

  it('generates full postgresql.conf with warnings', () => {
    expect(
      generate({
        dbVersion: '18',
        osType: 'linux',
        dbType: 'web',
        cpuNum: '8',
        totalMemory: '21',
        totalMemoryUnit: 'GB',
        connectionNum: '',
        hdType: 'ssd',
        dbSize: 'mid_ram'
      }).copyText
    ).toEqual(
      [
        '# WARNING (may prevent startup)',
        '# wal_compression = lz4 requires PostgreSQL compiled',
        '# with --with-lz4. Check build support:',
        "# SELECT enumvals FROM pg_settings WHERE name = 'wal_compression';",
        '#',
        '# io_method = io_uring requires PostgreSQL compiled',
        '# with --with-liburing, and io_uring allowed by the kernel',
        '# (kernel.io_uring_disabled sysctl) and by containers',
        '# (Docker default seccomp profile blocks it). Check build support:',
        "# SELECT enumvals FROM pg_settings WHERE name = 'io_method';",
        '#',
        '# NOTE',
        '# shared_buffers is large: reserve Linux huge pages',
        '# (vm.nr_hugepages) to reduce memory used by page tables',
        '# of each connection. Required number of huge pages',
        '# (with these settings, while the server is stopped):',
        '# postgres -D $PGDATA -C shared_memory_size_in_huge_pages',
        '',
        '# DB Version: 18',
        '# OS Type: Linux',
        '# DB Type: Web application',
        '# Total Memory (RAM): 21 GB',
        '# CPUs num: 8',
        '# Connections num: 200 (not provided, assumed)',
        '# Data Storage: SSD storage',
        '# Total Data Size: 1x - 3x RAM',
        '',
        'max_connections = 200                # restart required',
        'shared_buffers = 5376MB              # restart required',
        'effective_cache_size = 16128MB',
        'maintenance_work_mem = 1344MB',
        'wal_buffers = 16MB                   # restart required',
        'random_page_cost = 1.1',
        'effective_io_concurrency = 200',
        'maintenance_io_concurrency = 200',
        'work_mem = 25MB',
        'jit = off',
        'wal_compression = lz4',
        'autovacuum_work_mem = 1GB',
        'io_method = io_uring                 # restart required',
        'min_wal_size = 1GB',
        'max_wal_size = 4GB                   # needs free disk space',
        'max_worker_processes = 8             # restart required',
        'max_parallel_workers_per_gather = 4',
        'max_parallel_workers = 8',
        'max_parallel_maintenance_workers = 4'
      ].join('\n')
    )
  })

  it('generates full ALTER SYSTEM commands without warnings', () => {
    expect(
      generate(
        {
          dbVersion: '12',
          osType: 'linux',
          dbType: 'oltp',
          cpuNum: '2',
          totalMemory: '4',
          totalMemoryUnit: 'GB',
          connectionNum: '2000',
          hdType: 'san',
          dbSize: 'mid_ram'
        },
        { isAlterSystem: true, includeWarnings: false }
      ).copyText
    ).toEqual(
      [
        '-- DB Version: 12',
        '-- OS Type: Linux',
        '-- DB Type: Online transaction processing system',
        '-- Total Memory (RAM): 4 GB',
        '-- CPUs num: 2',
        '-- Connections num: 2000',
        '-- Data Storage: Network (SAN) storage',
        '-- Total Data Size: 1x - 3x RAM',
        '',
        "ALTER SYSTEM SET max_connections = '2000';             -- restart required",
        "ALTER SYSTEM SET shared_buffers = '1GB';               -- restart required",
        "ALTER SYSTEM SET effective_cache_size = '3GB';",
        "ALTER SYSTEM SET maintenance_work_mem = '256MB';",
        "ALTER SYSTEM SET checkpoint_completion_target = '0.9';",
        "ALTER SYSTEM SET wal_buffers = '16MB';                 -- restart required",
        "ALTER SYSTEM SET random_page_cost = '1.1';",
        "ALTER SYSTEM SET effective_io_concurrency = '300';",
        "ALTER SYSTEM SET work_mem = '4MB';",
        "ALTER SYSTEM SET jit = 'off';",
        "ALTER SYSTEM SET wal_compression = 'on';",
        "ALTER SYSTEM SET min_wal_size = '2GB';",
        "ALTER SYSTEM SET max_wal_size = '8GB';                 -- needs free disk space"
      ].join('\n')
    )
  })
})
