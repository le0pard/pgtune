# encoding: utf-8

module PgtuneHelpers
  def default_keywords_helper
    "pgtune, postgresql, postgres, tuning, config, configuration, free, open source"
  end

  def default_description_helper
    "PgTune - Tuning PostgreSQL config by your hardware"
  end

  def assets_manifest
    public_manifest_path = File.expand_path File.join(
      File.dirname(__FILE__),
      '../.tmp/dist/assets-manifest.json'
    )
    if File.exist?(public_manifest_path)
      JSON.parse(File.read(public_manifest_path))
    else
      {}
    end
  end

  def javascript_pack_tag(name)
    file_name = "#{name}.js"
    %(
      <script
        src="#{asset_pack_path(file_name)}"
        integrity="#{asset_pack_integrity(file_name)}"
        defer="defer"
        async="async"
        data-turbolinks-track="true"
        crossorigin="anonymous"></script>
    )
  end

  def stylesheet_pack_tag(name)
    file_name = "#{name}.css"
    %(
      <link
        href="#{asset_pack_path(file_name)}"
        integrity="#{asset_pack_integrity(file_name)}"
        rel="stylesheet"
        media="all"
        crossorigin="anonymous" />
    )
  end

  def asset_pack_path(name)
    assets_manifest.dig(name.to_s, 'src') || raise("asset #{name} not found in #{assets_manifest.inspect}")
  end

  def asset_pack_integrity(name)
    assets_manifest.dig(name.to_s,
                        'integrity') || raise("integrity for asset #{name} not found in #{assets_manifest.inspect}")
  end
end
