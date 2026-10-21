import DbTypes from '@common/components/dbTypes'

import './info-view.css'

const InfoView = () => (
  <div>
    <p>
      Provide basic information about the hardware, where PostgreSQL database is running. The
      configuration is generated as soon as required fields are filled in
    </p>
    <h2 className="info-view__title">Choosing &quot;DB Type&quot;</h2>
    <p className="info-view__hint">
      Choose the type closest to the main workload of the database. Database size is set separately
      in &quot;Total Data Size&quot;
    </p>
    <DbTypes />
  </div>
)

export default InfoView
