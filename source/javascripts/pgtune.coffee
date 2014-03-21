class Pgtune
  constructor: (@form) ->
    @form.submit @_generateConfigForm
    # init foundation
    $(document).foundation()
  _generateConfigForm: (event) =>
    event.preventDefault()
    @_generateConfig()
  _generateConfig: =>
    console.log "config"
    $('pre code').each (i, e) -> hljs.highlightBlock(e)

$ ->
  new Pgtune($('#pgTuneForm')) if $('#pgTuneForm').length