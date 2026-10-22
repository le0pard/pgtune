import { settingDescription, settingDocsUrl } from '../settingsDocs'

describe('settingDocsUrl', () => {
  it('links to setting in documentation of selected PostgreSQL version', () => {
    expect(settingDocsUrl('shared_buffers', 18)).toEqual(
      'https://www.postgresql.org/docs/18/runtime-config-resource.html#GUC-SHARED-BUFFERS'
    )
    expect(settingDocsUrl('autovacuum_vacuum_cost_delay', 11)).toEqual(
      'https://www.postgresql.org/docs/11/runtime-config-autovacuum.html#GUC-AUTOVACUUM-VACUUM-COST-DELAY'
    )
  })

  it('uses old anchor of max_parallel_maintenance_workers before PostgreSQL 14', () => {
    expect(settingDocsUrl('max_parallel_maintenance_workers', 13)).toEqual(
      'https://www.postgresql.org/docs/13/runtime-config-resource.html#GUC-MAX-PARALLEL-WORKERS-MAINTENANCE'
    )
    expect(settingDocsUrl('max_parallel_maintenance_workers', 14)).toEqual(
      'https://www.postgresql.org/docs/14/runtime-config-resource.html#GUC-MAX-PARALLEL-MAINTENANCE-WORKERS'
    )
  })

  it('has no link and description for unknown setting', () => {
    expect(settingDocsUrl('unknown_setting', 18)).toEqual(null)
    expect(settingDescription('unknown_setting')).toEqual(null)
  })
})
