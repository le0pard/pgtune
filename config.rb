# encoding: utf-8
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8
###

proxy "/manifest.appcache", "/pages/manifest.appcache", layout: false
ignore "/pages/manifest.appcache"

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

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'
set :markdown_engine, :kramdown
set :markdown, filter_html: false, fenced_code_blocks: true, smartypants: true
set :encoding, 'utf-8'

activate :sprockets do |c|
  c.expose_middleman_helpers = true
end

if defined?(RailsAssets)
  RailsAssets.load_paths.each do |path|
    sprockets.append_path path
  end
end

activate :autoprefixer do |config|
  config.browsers = ['last 2 versions']
end

# Build-specific configuration
configure :build do
  # For example, change the Compass output style for deployment
  activate :minify_css
  # Minify Javascript on build
  activate :minify_javascript
  # asset hash
  activate :asset_hash
  # min html
  activate :minify_html
  # favicons
  activate :favicon_maker do |f|
    f.template_dir  = 'source/images/favicons'
    f.output_dir    = 'build/images/favicons'
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
  deploy.deploy_method = :git
  deploy.branch = "gh-pages"
  deploy.clean = true
end
