-- WARNING (may prevent startup)
-- wal_compression = lz4 requires PostgreSQL compiled
-- with --with-lz4. Check build support:
-- SELECT enumvals FROM pg_settings WHERE name = 'wal_compression';
--
-- io_method = io_uring requires PostgreSQL compiled
-- with --with-liburing, and io_uring allowed by the kernel
-- (kernel.io_uring_disabled sysctl) and by containers
-- (Docker default seccomp profile blocks it). Check build support:
-- SELECT enumvals FROM pg_settings WHERE name = 'io_method';
--
-- NOTE
-- shared_buffers is large: reserve Linux huge pages
-- (vm.nr_hugepages) to reduce memory used by page tables
-- of each connection. Required number of huge pages
-- (with these settings, while the server is stopped):
-- postgres -D $PGDATA -C shared_memory_size_in_huge_pages

-- DB Version: 18
-- OS Type: Linux
-- DB Type: Web application
-- Total Memory (RAM): 21 GB
-- Connections num: 200 (not provided, assumed)
-- Data Storage: SSD storage
-- Total Data Size: 1x - 3x RAM

ALTER SYSTEM SET max_connections = '200';            -- restart required
ALTER SYSTEM SET shared_buffers = '5376MB';          -- restart required
ALTER SYSTEM SET effective_cache_size = '16128MB';
ALTER SYSTEM SET maintenance_work_mem = '1344MB';
ALTER SYSTEM SET wal_buffers = '16MB';               -- restart required
ALTER SYSTEM SET random_page_cost = '1.1';
ALTER SYSTEM SET effective_io_concurrency = '200';
ALTER SYSTEM SET maintenance_io_concurrency = '200';
ALTER SYSTEM SET work_mem = '25MB';
ALTER SYSTEM SET jit = 'off';
ALTER SYSTEM SET wal_compression = 'lz4';
ALTER SYSTEM SET autovacuum_work_mem = '1GB';
ALTER SYSTEM SET io_method = 'io_uring';             -- restart required
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';               -- needs free disk space
