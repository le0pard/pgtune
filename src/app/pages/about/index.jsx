import DbTypes from '@common/components/dbTypes'
import Logo from './logo.svg'

import './about.css'

const AboutPage = () => (
  <div className="about-page">
    <img className="about-page-logo" src={Logo} alt="PGTune" />
    <p>
      <strong>PGTune</strong> suggests PostgreSQL settings for maximum performance on the given
      hardware. It isn&apos;t a{' '}
      <a href="https://en.wikipedia.org/wiki/No_Silver_Bullet">silver bullet</a> for PostgreSQL
      optimization: many settings depend not only on the hardware, but also on the size of the
      database, the number of clients and the complexity of queries. An optimal configuration can be
      made only when all of these are taken into account, so use the result as a good starting
      point.
    </p>
    <h3>Principles</h3>
    <ul className="about-page-list">
      <li>
        Do no harm: generated settings should not make your database worse than PostgreSQL defaults,
        unless provided parameters justify it
      </li>
      <li>
        Settings, which can prevent PostgreSQL from starting on some builds or systems, are
        explained in warnings
      </li>
      <li>
        Settings, which take effect only after restart, are marked as &quot;restart required&quot;
      </li>
    </ul>
    <h3>Choosing DB Type</h3>
    <p>
      Choose the type closest to the main workload of the database. Database size is set separately
      in &quot;Total Data Size&quot;
    </p>
    <DbTypes />
    <h3>Before applying the configuration</h3>
    <ul className="about-page-list">
      <li>Read the warnings above the configuration</li>
      <li>Apply the configuration on a test or staging server first</li>
      <li>Apply the same settings on replicas</li>
      <li>Monitor the database after the change and adjust settings for your workload</li>
    </ul>
    <h3>Useful links</h3>
    <ul className="about-page-list">
      <li>
        <a href="https://github.com/le0pard/pgtune">Source code</a>
      </li>
      <li>
        <a href="https://twitter.com/leopard_me">My twitter</a>
      </li>
    </ul>
  </div>
)

export default AboutPage
