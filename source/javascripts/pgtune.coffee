class Pgtune
  constructor: (@form, @codeOut, @oldPgkernel) ->
    @form.submit @_generateConfigForm
    # init foundation
    $(document).foundation()

  # on submit
  _generateConfigForm: (event) =>
    event.preventDefault()
    @_generateConfig()

  # generate config
  _generateConfig: =>
    @_postgresSettings()
    @_kernelSettings()
    @_hightlightCode()

  # setting for pg
  _postgresSettings: =>
    gConfig = """
maintenance_work_mem = 128MB
effective_cache_size = 1536MB
work_mem = 6656kB
wal_buffers = 4MB
shared_buffers = 512MB
max_connections = 300
"""
    @codeOut.text(gConfig)

  # postgresql kernel
  _kernelSettings: =>
    gConfig = """
kernel.shmmax=3906293760
kernel.shmall=953685
"""
    @oldPgkernel.text(gConfig)
    $('#oldPostgresBlock').show()

  # highlight code
  _hightlightCode: =>
    $('pre code').each (i, e) ->
      $(e).removeClass('hljs')
      hljs.highlightBlock(e)

$ ->
  if $('#pgTuneForm').length and $('#postgresConfigOut').length and $('#postgresOldkernelOut').length
    new Pgtune($('#pgTuneForm'), $('#postgresConfigOut'), $('#postgresOldkernelOut'))