import { DB_TYPE_LABELS, DB_TYPE_DESCRIPTIONS } from '@features/configuration/labels'

import './db-types.css'

// DB types with workload description and examples
const DbTypes = () => (
  <dl className="db-types">
    {Object.entries(DB_TYPE_LABELS).map(([dbType, label]) => (
      <div key={dbType} className="db-types__item">
        <dt className="db-types__name">{label}</dt>
        <dd className="db-types__description">
          {DB_TYPE_DESCRIPTIONS[dbType].summary}. Examples: {DB_TYPE_DESCRIPTIONS[dbType].examples}
        </dd>
      </div>
    ))}
  </dl>
)

export default DbTypes
