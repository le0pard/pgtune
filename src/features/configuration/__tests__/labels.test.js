import { DB_TYPE_WEB, DB_TYPE_OLTP, DB_TYPE_DW, DB_TYPE_DESKTOP, DB_TYPE_MIXED } from '../constants'
import { DB_TYPE_LABELS, DB_TYPE_DESCRIPTIONS } from '../labels'

describe('DB type labels', () => {
  it('describes every DB type with label, summary and examples', () => {
    const dbTypes = [DB_TYPE_WEB, DB_TYPE_OLTP, DB_TYPE_DW, DB_TYPE_DESKTOP, DB_TYPE_MIXED]
    expect(Object.keys(DB_TYPE_LABELS)).toEqual(dbTypes)
    expect(Object.keys(DB_TYPE_DESCRIPTIONS).sort()).toEqual([...dbTypes].sort())
    dbTypes.forEach((dbType) => {
      expect(DB_TYPE_DESCRIPTIONS[dbType].summary).toBeTruthy()
      expect(DB_TYPE_DESCRIPTIONS[dbType].examples).toBeTruthy()
    })
  })

  it('describes workload only, without database size', () => {
    Object.values(DB_TYPE_DESCRIPTIONS).forEach(({ summary, examples }) => {
      expect(`${summary} ${examples}`).not.toMatch(/RAM|TB|GB/)
    })
  })
})
