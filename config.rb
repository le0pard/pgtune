# encoding: utf-8
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

Time.zone = "Kyiv"
###
# Blog settings
###

###
# Compass
###

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Page options, layouts, aliases and proxies
###

page "/manifest.appcache", proxy: "/pages/manifest.appcache", layout: false

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
# page "/path/to/file.html", :layout => :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", :locals => {
#  :which_fake_page => "Rendering a fake page with a local variable" }

###
# Helpers
###
helpers do
  def default_keywords_helper
    "pgtune, postgresql, postgres, tuning, config, configuration, free, open source"
  end
  def default_description_helper
    "PgTune - Tuning PostgreSQL config by your hardware"
  end
end

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Reload the browser automatically whenever files change
# activate :livereload

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'
set :markdown_engine, :redcarpet
set :markdown, filter_html: false, fenced_code_blocks: true, smartypants: true
set :encoding, 'utf-8'

# Build-specific configuration
configure :build do
  # For example, change the Compass output style for deployment
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript

  # Enable cache buster
  # activate :cache_buster

  # Use relative URLs
  # activate :relative_assets

  # Compress PNGs after build
  # First: gem install middleman-smusher
  #require "middleman-smusher"
  #activate :smusher

  # Or use a different image path
  # set :http_path, "/Content/images/"
  #
  activate :asset_hash
  # min html
  activate :minify_html

  activate :favicon_maker do |f|
    f.template_dir  = File.join(root, 'source/images/favicons')
    f.output_dir    = File.join(root, 'build/images/favicons')
    f.icons = {
      "favicon_base.png" => [
        { icon: "apple-touch-icon-152x152-precomposed.png", size: "152x152" },
        { icon: "apple-touch-icon-144x144-precomposed.png", size: "144x144" },
        { icon: "apple-touch-icon-120x120-precomposed.png", size: "120x120" },
        { icon: "apple-touch-icon-114x114-precomposed.png", size: "114x114" },
        { icon: "apple-touch-icon-76x76-precomposed.png", size: "76x76" },
        { icon: "apple-touch-icon-72x72-precomposed.png", size: "72x72" },
        { icon: "apple-touch-icon-60x60-precomposed.png", size: "60x60" },
        { icon: "apple-touch-icon-57x57-precomposed.png", size: "57x57" },
        { icon: "apple-touch-icon-precomposed.png", size: "57x57" },
        { icon: "apple-touch-icon.png", size: "57x57" },
        { icon: "favicon.png", size: "16x16" },
        { icon: "favicon.ico", size: "64x64,32x32,24x24,16x16" }
      ]
    }
  end
end

# deploy
activate :deploy do |deploy|
  deploy.method = :git
  deploy.branch = "gh-pages"
  deploy.clean = true
end