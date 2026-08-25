[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$envPath = Join-Path $root ".supabase\docker\.env"
$configPath = Join-Path $root "supabase\config.toml"

if (-not (Test-Path -LiteralPath $envPath)) {
  throw "Run infra/supabase/bootstrap.ps1 first."
}
if (-not (Test-Path -LiteralPath $configPath)) {
  throw "supabase/config.toml is required for Supabase CLI migrations."
}

$values = @{}
foreach ($line in [System.IO.File]::ReadAllLines($envPath)) {
  if ($line -match "^([^#=]+)=(.*)$") {
    $values[$matches[1]] = $matches[2]
  }
}

if (-not $values.ContainsKey("POSTGRES_PASSWORD")) {
  throw "POSTGRES_PASSWORD is missing from the generated runtime environment."
}
$port = if ($values.ContainsKey("POSTGRES_DIRECT_PORT")) { $values["POSTGRES_DIRECT_PORT"] } else { "54322" }
$encodedPassword = [System.Uri]::EscapeDataString($values["POSTGRES_PASSWORD"])
$dbUrl = "postgresql://postgres:$encodedPassword@127.0.0.1:$port/postgres"
$arguments = @("supabase", "db", "push", "--db-url", $dbUrl, "--yes")

Push-Location $root
try {
  & npx.cmd @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Supabase CLI migration failed."
  }
} finally {
  Pop-Location
}
