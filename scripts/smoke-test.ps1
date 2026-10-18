$ErrorActionPreference = "Stop"
$health = Invoke-RestMethod -Uri "http://localhost:8000/health"
$version = Invoke-RestMethod -Uri "http://localhost:8000/version"
if ($health.status -ne "ok") { throw "Health check failed" }
Write-Host "EchoScript API healthy - version $($version.version), color $($version.color)"

