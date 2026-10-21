// Short description and PostgreSQL documentation page (runtime-config-*.html) for each setting
const SETTINGS_DOCS = {
  max_connections: {
    page: 'connection',
    description: 'Maximum number of concurrent client connections'
  },
  shared_buffers: {
    page: 'resource',
    description: 'Memory PostgreSQL uses for its own data cache'
  },
  effective_cache_size: {
    page: 'query',
    description: 'Planner estimate of memory available for disk caching (nothing is allocated)'
  },
  maintenance_work_mem: {
    page: 'resource',
    description: 'Memory for maintenance operations: VACUUM, CREATE INDEX, ADD FOREIGN KEY'
  },
  checkpoint_completion_target: {
    page: 'wal',
    description: 'Fraction of checkpoint interval to spread checkpoint writes over'
  },
  wal_buffers: {
    page: 'wal',
    description: 'Shared memory for WAL data not yet written to disk'
  },
  default_statistics_target: {
    page: 'query',
    description: 'Amount of statistics ANALYZE collects for the query planner'
  },
  random_page_cost: {
    page: 'query',
    description: 'Planner cost of a randomly fetched disk page (sequential page costs 1)'
  },
  effective_io_concurrency: {
    page: 'resource',
    description: 'Number of concurrent disk I/O requests a single query can issue'
  },
  maintenance_io_concurrency: {
    page: 'resource',
    description: 'Number of concurrent disk I/O requests for maintenance work'
  },
  work_mem: {
    page: 'resource',
    description: 'Memory for each sort or hash operation before it spills to disk'
  },
  jit: {
    page: 'query',
    description: 'Just-in-time compilation of queries'
  },
  wal_compression: {
    page: 'wal',
    description: 'Compression of full page images written to WAL'
  },
  autovacuum_max_workers: {
    page: 'autovacuum',
    description: 'Maximum number of autovacuum processes running at the same time'
  },
  autovacuum_work_mem: {
    page: 'resource',
    description: 'Memory for each autovacuum worker'
  },
  io_method: {
    page: 'resource',
    description: 'Method for asynchronous I/O'
  },
  io_workers: {
    page: 'resource',
    description: 'Number of I/O worker processes'
  },
  io_max_workers: {
    page: 'resource',
    description: 'Maximum number of I/O worker processes'
  },
  min_wal_size: {
    page: 'wal',
    description: 'WAL files up to this size are recycled instead of removed'
  },
  max_wal_size: {
    page: 'wal',
    description: 'WAL size between automatic checkpoints (soft limit)'
  },
  max_worker_processes: {
    page: 'resource',
    description: 'Maximum number of background processes: parallel workers, replication, extensions'
  },
  max_parallel_workers_per_gather: {
    page: 'resource',
    description: 'Maximum number of parallel workers for a single query node'
  },
  max_parallel_workers: {
    page: 'resource',
    description: 'Maximum number of parallel workers for all queries at the same time'
  },
  max_parallel_maintenance_workers: {
    page: 'resource',
    description: 'Maximum number of parallel workers for a single CREATE INDEX or VACUUM'
  },
  wal_level: {
    page: 'wal',
    description: 'How much information is written to WAL'
  },
  max_wal_senders: {
    page: 'replication',
    description: 'Maximum number of replication connections'
  }
}

const settingAnchor = (key, dbVersion) => {
  // anchor was renamed in PostgreSQL 14 documentation
  if (key === 'max_parallel_maintenance_workers' && dbVersion < 14) {
    return 'GUC-MAX-PARALLEL-WORKERS-MAINTENANCE'
  }
  return `GUC-${key.toUpperCase().replace(/_/g, '-')}`
}

export const settingDescription = (key) => SETTINGS_DOCS[key]?.description || null

export const settingDocsUrl = (key, dbVersion) => {
  if (!SETTINGS_DOCS[key]) {
    return null
  }
  return `https://www.postgresql.org/docs/${dbVersion}/runtime-config-${SETTINGS_DOCS[key].page}.html#${settingAnchor(key, dbVersion)}`
}
