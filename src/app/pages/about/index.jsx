import Logo from './logo.svg'

import './about.css'

const AboutPage = () => (
  <div className="about-page">
    <img className="about-page-logo" src={Logo} alt="PGTune" />
    <p>
      <strong>PGTune</strong> calculates configuration for PostgreSQL based on the maximum
      performance for a given hardware configuration. It isn&apos;t a{' '}
      <a href="https://en.wikipedia.org/wiki/No_Silver_Bullet">silver bullet</a> for the
      optimization settings of PostgreSQL. Many settings depend not only on the hardware
      configuration, but also on the size of the database, the number of clients and the complexity
      of queries. An optimal configuration of the database can only be made given all these
      parameters are taken into account.
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
    <h3>How settings are calculated</h3>
    <ul className="about-page-list">
      <li>
        <strong>max_connections</strong>: provided number of connections. If empty: 200 for web, 300
        for OLTP and 100 for other types, lowered when memory can not fit them, but never below 100
        (PostgreSQL default)
      </li>
      <li>
        <strong>shared_buffers</strong>: 25% of RAM (6.25% for desktop).{' '}
        <strong>effective_cache_size</strong>: 75% of RAM (25% for desktop)
      </li>
      <li>
        <strong>work_mem</strong>: (RAM - shared_buffers) / ((max_connections +
        max_parallel_workers) * 3), as each query can run several sorts and hashes at the same time.
        Divided by 2 for data warehouse and mixed types, by 6 for desktop. 30% more if the database
        is smaller than RAM, 10% less if it is more than 3x RAM. Not less than 4MB
      </li>
      <li>
        <strong>maintenance_work_mem</strong>: RAM / 16 (RAM / 8 for data warehouse), up to 8GB (up
        to 2GB on Windows before PostgreSQL 18). <strong>autovacuum_work_mem</strong>: up to 1GB per
        worker
      </li>
      <li>
        <strong>min_wal_size</strong> / <strong>max_wal_size</strong>: by DB type, from 100MB / 2GB
        for desktop to 4GB / 16GB for data warehouse. <strong>wal_buffers</strong>: 1/32 of
        shared_buffers, up to 16MB (same as PostgreSQL picks automatically).{' '}
        <strong>checkpoint_completion_target</strong>: 0.9 (default since PostgreSQL 14)
      </li>
      <li>
        <strong>random_page_cost</strong>: 1.1 for SSD, NVMe and SAN storage or when the database
        fits in RAM, 4 for HDD and for data warehouses larger than RAM.{' '}
        <strong>effective_io_concurrency</strong> and <strong>maintenance_io_concurrency</strong>:
        by storage type, from 2 for HDD to 1000 for NVMe
      </li>
      <li>
        <strong>Parallel workers</strong> (if 4 or more CPUs provided):{' '}
        <strong>max_parallel_workers</strong> equals CPUs (up to 1024),{' '}
        <strong>max_worker_processes</strong> is never lower than 8 (PostgreSQL default),{' '}
        <strong>max_parallel_workers_per_gather</strong> is half of CPUs, but not more than 4 (for
        data warehouse not more than 1/4 of all workers, so several queries can run in parallel)
      </li>
      <li>
        <strong>autovacuum_max_workers</strong>: 4 for 16+ CPUs, 5 for 32+ CPUs.{' '}
        <strong>io_workers</strong> (<strong>io_max_workers</strong> in PostgreSQL 19): about 25% of
        CPUs, up to 32
      </li>
      <li>
        <strong>default_statistics_target</strong>: 500 for data warehouse. <strong>jit</strong>:
        off for web, OLTP and mixed types (PostgreSQL 12 - 18). <strong>wal_compression</strong>:
        lz4 for PostgreSQL 15 - 18, on for other versions. <strong>io_method</strong>: io_uring on
        Linux (PostgreSQL 18+). <strong>wal_level</strong>: minimal for desktop
      </li>
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
