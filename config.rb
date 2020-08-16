# encoding: utf-8
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

require "lib/middleman_patches"

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

assets_dir = File.expand_path('.tmp/dist', __dir__)

activate :external_pipeline,
  name: :webpack,
  command: build? ?
    "yarn run assets:build" :
    'yarn run assets:watch',
  source: assets_dir,
  latency: 2,
  ignore_exit_code: true

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

configure :build do
    # min html
  activate :minify_html
  # gzip
  activate :gzip, exts: %w(.css .htm .html .js .svg .xhtml)
end

after_build do
  system('yarn run critical')
end
