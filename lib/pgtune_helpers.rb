# encoding: utf-8
require 'digest'

module PgtuneHelpers
  def default_keywords_helper
    "pgtune, postgresql, postgres, tuning, config, configuration, free, open source"
  end

  def default_description_helper
    "PgTune - Tuning PostgreSQL config by your hardware"
  end

  def javascript_pack_tag(name)
    file_name = "#{name}.js"
    %(<script src="#{asset_path(file_name)}"
      integrity="#{integrity_hash(file_name)}"
      defer="defer" async="async"></script>)
  end

  def stylesheet_pack_tag(name)
    file_name = "#{name}.css"
    %(<link href="#{asset_path(file_name)}" rel="stylesheet" media="all" />)
  end

  def asset_path(name)
    public_manifest_path = File.expand_path File.join(
      File.dirname(__FILE__),
      '../.tmp/dist/assets-manifest.json',
    )
    manifest_data = if File.exist?(public_manifest_path)
                      JSON.parse(File.read(public_manifest_path))
                    else
                      {}
                    end

    manifest_data[name.to_s]
  end

  def integrity_hash(file)
    file_path = File.expand_path File.join(
      File.dirname(__FILE__),
      "../.tmp/dist#{asset_path(file)}",
    )

    digest = Digest::SHA512.new.update(File.read(file_path)).digest
    "sha512-#{[digest].pack('m0')}"
  end
end
