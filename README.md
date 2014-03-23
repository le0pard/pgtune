# [PgTune](http://pgtune.leopard.in.ua/)

Tuning PostgreSQL config by your hardware. Based on original [pgtune](http://pgfoundry.org/projects/pgtune/).



## Development

Main calculation logic [here](https://github.com/le0pard/pgtune/blob/master/source/javascripts/pgtune.coffee).
Web app build on top of [middleman](http://middlemanapp.com/). To start it in development mode, you need install ruby and run in terminal:

```bash
$ bundle # get all deps
$ middleman server # start server on 4567 port
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request