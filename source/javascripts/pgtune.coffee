class Pgtune
  constructor: (@form, @codeOut, @oldPgkernel) ->
    # submit form with data
    @form.submit @_generateConfigForm
    # on tab submit form ("Next" button on mobile keyboard)
    if Modernizr.touch
      $('#pgtTotalMemValue').on 'keydown', @_mobileNextButton
      $('#pgtConnectionsValue').on 'keydown', @_mobileNextButton
    # appcache
    @_initAppcache()
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
    # init foundation
    try
      $(document).foundation()
    catch e
      console.warn "Too old browser with error: #{e}" if console.warn?

  # on submit
  _generateConfigForm: (event) =>
    event.preventDefault()
    $('span.clearHintForUser').remove()
    @_generateConfig()

  # mobile next button
  _mobileNextButton: (e) =>
    @form.submit() if e.which? and e.which is 9

  # generate config
  _generateConfig: =>
    @dbVersion = parseFloat($('#pgtDbVersionValue').val())
    @osType = $('#pgtOsTypeValue').val()
    @osType = 'linux' if jQuery.inArray(@osType, ['linux', 'windows']) is -1

    @dbType = $('#pgtDbTypeValue').val()
    unless @conByType[@dbType]?
      @dbType = 'mixed'
      $('#pgtDbTypeValue').val(@dbType)

    constForSize = @constSize[$('#pgtTotalMemMeasValue').val()]
    constForSize = @constSize['GB'] unless constForSize?
    memInSize = parseInt($('#pgtTotalMemValue').val(), 10)
    # validate
    if memInSize < 1 or memInSize > 9999
      memInSize = 2
      $('#pgtTotalMemValue').val(memInSize)
    @totalMemory = parseInt(memInSize, 10) * constForSize

    @_postgresSettings()
    @_kernelSettings()
    @_hightlightCode()

  # setting for pg
  _postgresSettings: =>
    gConfig =
      max_connections: @conByType[@dbType]
    # Allow overriding the maximum connections
    gConfig['max_connections'] = parseInt($('#pgtConnectionsValue').val(), 10) if $('#pgtConnectionsValue').val().length
    # validate
    if gConfig['max_connections'] < 1 or gConfig['max_connections'] > 9999
      gConfig['max_connections'] = @conByType[@dbType]

    memoryInKB = @totalMemory / @constSize['KB']

    # messages in config
    infoMsg = ""

    # setting message
    settingsInfo = [
      ["DB Version", @dbVersion],
      ["OS Type", @osType],
      ["DB Type", @dbType],
      ["Total Memory (RAM)", "#{$('#pgtTotalMemValue').val()} #{$('#pgtTotalMemMeasValue').val()}"],
      ["Number of Connections", gConfig['max_connections']]
    ]

    settingsInfo = settingsInfo.map((setting) => "# #{setting[0]}: #{setting[1]}")

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
      # and not more, whan 8GB for linux
      # not true right now for new versions
      #else if 'windows' isnt @osType and gConfig['shared_buffers'] > (8 * @constSize['GB'] / @constSize['KB'])
      #  gConfig['shared_buffers'] = (8 * @constSize['GB'] / @constSize['KB'])
      # effective_cache_size
      gConfig['effective_cache_size'] = {
        web: Math.floor(memoryInKB * 3 / 4),
        oltp: Math.floor(memoryInKB * 3 / 4),
        dw: Math.floor(memoryInKB * 3 / 4),
        desktop: Math.floor(memoryInKB / 4),
        mixed: Math.floor(memoryInKB * 3 / 4)
      }[@dbType]
      # work_mem is assigned any time a query calls for a sort, or a hash, or any other structure that needs a space allocation, which can happen multiple times per query. So you're better off assuming max_connections * 2 or max_connections * 3 is the amount of RAM that will actually use in reality. At the very least, you need to subtract shared_buffers from the amount you're distributing to connections in work_mem.
      # The other thing to consider is that there's no reason to run on the edge of available memory. If you do that, there's a very high risk the out-of-memory killer will come along and start killing PostgreSQL backends. Always leave a buffer of some kind in case of spikes in memory usage. So your maximum amount of memory available in work_mem should be ((RAM - shared_buffers) / 2 / (max_connections * 3)).
      workMem = (memoryInKB - gConfig['shared_buffers']) / (gConfig['max_connections'] * 3)
      gConfig['work_mem'] = {
        web: Math.floor(workMem),
        oltp: Math.floor(workMem),
        dw: Math.floor(workMem / 2),
        desktop: Math.floor(workMem / 6),
        mixed: Math.floor(workMem / 2)
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

      if @totalMemory >= (100 * @constSize['GB']) # such setting can be even bad for very high memory systems, need show warnings
        infoMsg = "# WARNING\n# this tool not being optimal \n# for very high memory systems\n"
    else
      infoMsg = "# WARNING\n# this tool not being optimal \n# for low memory systems\n"

    if @dbVersion < 9.5
      # checkpoint_segments
      gConfig['checkpoint_segments'] = {
        web: 32,
        oltp: 64,
        dw: 128,
        desktop: 3,
        mixed: 32
      }[@dbType]
    else
      gConfig['min_wal_size'] = {
        web: (1024 * @constSize['MB'] / @constSize['KB']),
        oltp: (2048 * @constSize['MB'] / @constSize['KB']),
        dw: (4096 * @constSize['MB'] / @constSize['KB']),
        desktop: (100 * @constSize['MB'] / @constSize['KB']),
        mixed: (1024 * @constSize['MB'] / @constSize['KB'])
      }[@dbType]
      gConfig['max_wal_size'] = {
        web: (2048 * @constSize['MB'] / @constSize['KB']),
        oltp: (4096 * @constSize['MB'] / @constSize['KB']),
        dw: (8192 * @constSize['MB'] / @constSize['KB']),
        desktop: (100 * @constSize['MB'] / @constSize['KB']),
        mixed: (2048 * @constSize['MB'] / @constSize['KB'])
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
    if gConfig['shared_buffers']?
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
    @codeOut.text("#{infoMsg}#{settingsInfo.join("\n")}\n\n#{arrayConfig.join("\n")}")

  # postgresql kernel
  _kernelSettings: =>
    kernelBlockEl = $('#oldPostgresBlock')

    if 'windows' is @osType or @dbVersion > 9.3
      kernelBlockEl.hide()
    else
      shmall = Math.floor(@totalMemory / 8192)
      gConfig = """
  kernel.shmmax=#{shmall * 4096}
  kernel.shmall=#{shmall}
  """
      @oldPgkernel.text(gConfig)

      kernelBlockEl.find('.pg_version').text(@dbVersion)
      kernelBlockEl.show()

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
    ['max_connections', 'checkpoint_segments',
    'checkpoint_completion_target', 'default_statistics_target',
    'random_page_cost', 'seq_page_cost']

  # appcache
  _initAppcache: =>
    return unless Modernizr.applicationcache is true
    window.applicationCache.addEventListener 'updateready', @_appCacheUpdated, false
  # new assets available
  _appCacheUpdated: (e) =>
    return unless window.applicationCache.status is window.applicationCache.UPDATEREADY
    window.location.reload() if confirm('A new version of this app is available. Load it?')


# init
$ ->
  if $('#pgTuneForm').length and $('#postgresConfigOut').length and $('#postgresOldkernelOut').length
    new Pgtune($('#pgTuneForm'), $('#postgresConfigOut'), $('#postgresOldkernelOut'))
