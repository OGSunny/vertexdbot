[build]
  functions = "netlify/functions"
  base = "project"  # Optional: Point to your project root if not the default
  publish = "public"  # Ensure this matches your output directory if using pages

[functions]
  node_bundler = "esbuild"
  included_files = ["netlify/functions/**"]  # Explicitly include function files

# Define build contexts to separate page and function builds
[context.production]
  command = "npm install && npm run build"  # Adjust if you have a build command
  environment = { NODE_VERSION = "18" }  # Match your Node version

[context.deploy-preview]
  command = "npm install && npm run build"

# Ensure functions build even if pages fail
[functions]
  ignored_build = false  # Prevent cancellation due to page build failures

[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, x-auth-token"

# Enable Netlify Blobs
[blobs]
  stores = ["vertexHubData"]
