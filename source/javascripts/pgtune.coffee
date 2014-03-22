class Pgtune
  constructor: (@form, @codeOut, @oldPgkernel) ->
    @form.submit @_generateConfigForm
    # init foundation
    $(document).foundation()
    # constants
    @constSize =
      KB: 1024
      MB: 1048576
      GB: 1073741824
      TB: 1099511627776
      # helpers
      KB_PER_GB: 1048576
      KB_PER_MB: 1024

    @conByType =
      web: 200
      oltp: 300
      dw: 20
      desktop: 5
      mixed: 100

  # on submit
  _generateConfigForm: (event) =>
    event.preventDefault()
    @_generateConfig()

  # generate config
  _generateConfig: =>
    @osType = $('#pgtOsTypeValue').val()

    @dbType = $('#pgtDbTypeValue').val()
    @dbType = 'mixed' unless @conByType[@dbType]?

    constForSize = @constSize[$('#pgtTotalMemMeasValue').val()]
    constForSize = @constSize['GB'] unless constForSize?
    @totalMemory = parseInt($('#pgtTotalMemValue').val(), 10) * constForSize

    @_postgresSettings()
    @_kernelSettings()
    @_hightlightCode()

  # setting for pg
  _postgresSettings: =>
    gConfig =
      max_connections: @conByType[@dbType]
    # Allow overriding the maximum connections
    gConfig['max_connections'] = parseInt($('#pgtConnectionsValue').val(), 10) if $('#pgtConnectionsValue').val().length

    memoryInKB = @totalMemory / @constSize['KB']

    # this tool not being optimal for low memory systems
    if @totalMemory >= (256 * @constSize['MB'])
      # shared_buffers
      gConfig['shared_buffers'] = {
        web: Math.floor(memoryInKB / 4),
        oltp: Math.floor(memoryInKB / 4),
        dw: Math.floor(memoryInKB / 4),
        desktop: Math.floor(memoryInKB / 16),
        mixed: Math.floor(memoryInKB / 4)
      }[@dbType]
      # Limit shared_buffers to 512MB on Windows
      if 'windows' is @osType and gConfig['shared_buffers'] > (512 * @constSize['MB'] / @constSize['KB'])
        gConfig['shared_buffers'] = (512 * @constSize['MB'] / @constSize['KB'])
      # effective_cache_size
      gConfig['effective_cache_size'] = {
        web: Math.floor(memoryInKB * 3 / 4),
        oltp: Math.floor(memoryInKB * 3 / 4),
        dw: Math.floor(memoryInKB * 3 / 4),
        desktop: Math.floor(memoryInKB / 4),
        mixed: Math.floor(memoryInKB * 3 / 4)
      }[@dbType]
      # effective_cache_size
      gConfig['work_mem'] = {
        web: Math.floor(memoryInKB / gConfig['max_connections']),
        oltp: Math.floor(memoryInKB / gConfig['max_connections']),
        dw: Math.floor(memoryInKB / gConfig['max_connections'] / 2),
        desktop: Math.floor(memoryInKB / gConfig['max_connections'] / 6),
        mixed: Math.floor(memoryInKB / gConfig['max_connections'] / 2)
      }[@dbType]
      # maintenance_work_mem
      gConfig['maintenance_work_mem'] = {
        web: Math.floor(memoryInKB / 16),
        oltp: Math.floor(memoryInKB / 16),
        dw: Math.floor(memoryInKB / 8),
        desktop: Math.floor(memoryInKB / 16),
        mixed: Math.floor(memoryInKB / 16)
      }[@dbType]
      # Cap maintenance RAM at 2GB on servers with lots of memory
      if gConfig['maintenance_work_mem'] > (2 * @constSize['GB'] / @constSize['KB'])
        gConfig['maintenance_work_mem'] = Math.floor(2 * @constSize['GB'] / @constSize['KB'])

    else
      gConfig['# WARNING'] = "\n# this tool not being optimal \n# for low memory systems"

    # checkpoint_segments
    gConfig['checkpoint_segments'] = {
      web: 32,
      oltp: 64,
      dw: 128,
      desktop: 3,
      mixed: 32
    }[@dbType]
    # checkpoint_completion_target
    gConfig['checkpoint_completion_target'] = {
      web: 0.7,
      oltp: 0.9,
      dw: 0.9,
      desktop: 0.5,
      mixed: 0.9
    }[@dbType]
    # wal_buffers
    # Follow auto-tuning guideline for wal_buffers added in 9.1, where it's
    # set to 3% of shared_buffers up to a maximum of 16MB.
    gConfig['wal_buffers'] = Math.floor(3 * gConfig['shared_buffers'] / 100)
    if gConfig['wal_buffers'] > (16 * @constSize['MB'] / @constSize['KB'])
      gConfig['wal_buffers'] = Math.floor(16 * @constSize['MB'] / @constSize['KB'])
    # It's nice of wal_buffers is an even 16MB if it's near that number.  Since
    # that is a common case on Windows, where shared_buffers is clipped to 512MB,
    # round upwards in that situation
    if (14 * @constSize['MB'] / @constSize['KB']) < gConfig['wal_buffers'] < (16 * @constSize['MB'] / @constSize['KB'])
      gConfig['wal_buffers'] = Math.floor(16 * @constSize['MB'] / @constSize['KB'])
    # default_statistics_target
    gConfig['default_statistics_target'] = {
      web: 100,
      oltp: 100,
      dw: 500,
      desktop: 100,
      mixed: 100
    }[@dbType]

    arrayConfig = ("#{key} = #{@_formatedValue(key, value)}" for key, value of gConfig)
    @codeOut.text(arrayConfig.join("\n"))

  # postgresql kernel
  _kernelSettings: =>
    if 'windows' is @osType
      $('#oldPostgresBlock').hide()
    else
      shmall = Math.floor(@totalMemory / 8192)
      gConfig = """
  kernel.shmmax=#{shmall * 4096}
  kernel.shmall=#{shmall}
  """
      @oldPgkernel.text(gConfig)
      $('#oldPostgresBlock').show()

  # highlight code
  _hightlightCode: =>
    $('pre code').each (i, e) ->
      $(e).removeClass('hljs')
      hljs.highlightBlock(e)

  # format size values
  _formatedValue: (key, value) =>
    return "#{value}" unless jQuery.inArray(key, @_notSizeValues()) is -1
    # This uses larger units only if there's no loss of resolution in displaying
    # with that value.  Therefore, if using this to output newly assigned
    # values, that value needs to be rounded appropriately if you want
    # it to show up as an even number of MB or GB
    if value % @constSize['KB_PER_GB'] is 0
      value = Math.floor(value / @constSize['KB_PER_GB'])
      unit = "GB"
    else if value % @constSize['KB_PER_MB'] is 0
      value = Math.floor(value / @constSize['KB_PER_MB'])
      unit = "MB"
    else
      unit = "kB"
    # return formatted
    return "#{value}#{unit}"
  # not size values
  _notSizeValues: =>
    ['max_connections', 'checkpoint_segments', 'checkpoint_completion_target', 'default_statistics_target', '# WARNING']

$ ->
  if $('#pgTuneForm').length and $('#postgresConfigOut').length and $('#postgresOldkernelOut').length
    new Pgtune($('#pgTuneForm'), $('#postgresConfigOut'), $('#postgresOldkernelOut'))