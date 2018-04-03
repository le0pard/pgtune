# encoding: utf-8
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

# activate :autoprefixer do |prefix|
#   prefix.browsers = "last 2 versions"
# end

# Layouts
# https://middlemanapp.com/basics/layouts/

# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false
page '/404.html', layout: false

###
# Helpers
###

require "lib/pgtune_helpers"
helpers PgtuneHelpers

assets_dir = ".tmp/dist"

activate :external_pipeline,
  name: :webpack,
  command: build? ?
    "rm -fr #{assets_dir}/* && NODE_ENV=production ./node_modules/.bin/webpack --bail" :
    './node_modules/.bin/webpack --watch -d --color',
  source: assets_dir,
  latency: 1

# With alternative layout
# page '/path/to/file.html', layout: 'other_layout'

set :markdown_engine, :kramdown
set :markdown, filter_html: false, fenced_code_blocks: true, smartypants: true
set :encoding, "utf-8"

# Proxy pages
# https://middlemanapp.com/advanced/dynamic-pages/

# proxy(
#   '/this-page-has-no-template.html',
#   '/template-file.html',
#   locals: {
#     which_fake_page: 'Rendering a fake page with a local variable'
#   },
# )

# Helpers
# Methods defined in the helpers block are available in templates
# https://middlemanapp.com/basics/helper-methods/

# helpers do
#   def some_helper
#     'Helping'
#   end
# end

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings

# configure :build do
#   activate :minify_css
#   activate :minify_javascript
# end

set :images_dir, 'images'

activate :gzip, exts: %w(.css .htm .html .js .svg .xhtml)

configure :build do
  # min html
  activate :minify_html
end

activate :s3_sync do |s3_sync|
  default_caching_policy public: true, max_age: (60 * 60 * 24 * 10)

  s3_sync.delete                     = true # We delete stray files by default.
  s3_sync.after_build                = false # We do not chain after the build step by default.
  s3_sync.prefer_gzip                = true
  s3_sync.path_style                 = true
  s3_sync.reduced_redundancy_storage = false
  s3_sync.acl                        = 'public-read'
  s3_sync.encryption                 = false
  s3_sync.prefix                     = ''
  s3_sync.version_bucket             = false
  s3_sync.index_document             = 'index.html'
  s3_sync.error_document             = '404.html'
end
