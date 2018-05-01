require 'aws-sdk-cloudfront'
require 'yaml'

desc "Build app"
task :build do
  puts "## Building website (middleman build --clean)"
  status = system("bundle exec middleman build --clean")
  puts status ? "OK" : "FAILED"
end

desc "Deploy app"
task :deploy do
  puts "## Deploying website (middleman s3_sync)"
  status = system("bundle exec middleman s3_sync")
  puts status ? "OK" : "FAILED"
end

desc "Release app"
task :release, [] => [:build, :deploy] do
  root_path = File.expand_path File.dirname(__FILE__)
  config_file_path = File.join(root_path, '.s3_sync')
  aws_config = if File.exist?(config_file_path)
    YAML.load(File.open(config_file_path, 'r'))
  else
    {}
  end

  cloudfront = Aws::CloudFront::Client.new({
    access_key_id: aws_config['aws_access_key_id'],
    secret_access_key: aws_config['aws_secret_access_key'],
    region: aws_config['region']
  })
  resp = cloudfront.create_invalidation({
    distribution_id: 'E2OZ07LKN2FM73',
    invalidation_batch: {
      paths: {
        quantity: 1,
        items:['/*']
      },
      caller_reference: "From rake #{Time.now}"
    }
  })
  unless resp.invalidation.status == 'InProgress'
    raise "Error while invalidating cache: \n#{resp.inspect}"
  end
end
