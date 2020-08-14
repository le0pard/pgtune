require 'middleman-core'
require 'htmlcompressor'

class MinifyHtmlExtension < ::Middleman::Extension

  DEFAULT_OPTIONS = {
    enabled: true,
    remove_multi_spaces: true,
    remove_comments: true,
    remove_intertag_spaces: false,
    remove_quotes: true,
    compress_css: false,
    compress_javascript: false,
    simple_doctype: false,
    remove_script_attributes: true,
    remove_style_attributes: true,
    remove_link_attributes: true,
    remove_form_attributes: false,
    remove_input_attributes: true,
    remove_javascript_protocol: true,
    remove_http_protocol: false,
    remove_https_protocol: false,
    preserve_line_breaks: false,
    simple_boolean_attributes: true
  }.freeze

  option :ignore, [], 'Patterns to avoid minifying'
  option :content_types, %w[text/html], 'Content types of resources that contain HTML'
  option :compress_options, {}, 'HTML compress options'

  def initialize(app, _options_hash = ::Middleman::EMPTY_HASH, &block)
    super

    @ignore = Array(options[:ignore])
    @compressor = HtmlCompressor::Compressor.new(
      DEFAULT_OPTIONS.merge(options[:compress_options])
    )
  end

  def manipulate_resource_list_container!(resource_list)
    resource_list.by_binary(false).each do |r|
      type = r.content_type.try(:slice, /^[^;]*/)
      if minifiable?(type) && !ignore?(r.destination_path)
        r.add_filter method(:minify)
      end
    end
  end

  def minifiable?(content_type)
    options[:content_types].include?(content_type)
  end
  memoize :minifiable?

  def ignore?(path)
    @ignore.any? { |ignore| ::Middleman::Util.path_match(ignore, path) }
  end
  memoize :ignore?

  def minify(content)
    @compressor.compress(content)
  end
  memoize :minify

end

::Middleman::Extensions.register(:minify_html, MinifyHtmlExtension)
