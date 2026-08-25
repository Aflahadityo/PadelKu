[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$snapshotRef = "self-hosted/v0.8.0"
$snapshotCommit = "241bb11c0627f2981746d37033f57dbfa81d29b0"
$repository = "https://github.com/supabase/supabase.git"
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$runtimeRoot = Join-Path $root ".supabase"
$runtime = Join-Path $runtimeRoot "docker"
$stamp = Join-Path $runtime ".supabase-version"

function Require-Command([string]$Name) {
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $command) {
    throw "Required command '$Name' was not found."
  }
  return $command
}

function Find-GitShell([string]$GitPath) {
  $shell = Get-Command "sh" -ErrorAction SilentlyContinue
  if ($shell) {
    return $shell.Source
  }

  $gitRoot = Split-Path (Split-Path $GitPath -Parent) -Parent
  $candidates = @(
    (Join-Path $gitRoot "bin\sh.exe"),
    (Join-Path $gitRoot "usr\bin\sh.exe")
  )
  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) {
      return $candidate
    }
  }
  throw "Git for Windows sh.exe was not found. Reinstall Git with its Unix tools."
}

function Set-EnvValue([string]$Path, [string]$Key, [string]$Value) {
  $lines = [System.Collections.Generic.List[string]]::new()
  $lines.AddRange([string[]][System.IO.File]::ReadAllLines($Path))
  $found = $false
  for ($index = 0; $index -lt $lines.Count; $index++) {
    if ($lines[$index] -match ("^" + [regex]::Escape($Key) + "=")) {
      $lines[$index] = "$Key=$Value"
      $found = $true
      break
    }
  }
  if (-not $found) {
    $lines.Add("$Key=$Value")
  }
  [System.IO.File]::WriteAllText($Path, (($lines -join "`n") + "`n"), [System.Text.UTF8Encoding]::new($false))
}

$git = Require-Command "git"
$shellPath = Find-GitShell $git.Source
Require-Command "node" | Out-Null
Require-Command "docker" | Out-Null
& $shellPath -lc "command -v openssl >/dev/null 2>&1"
if ($LASTEXITCODE -ne 0) {
  throw "OpenSSL is unavailable in the Git shell environment."
}
& docker compose version | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Docker Compose is unavailable."
}

if (-not (Test-Path -LiteralPath $runtimeRoot)) {
  New-Item -ItemType Directory -Path $runtimeRoot | Out-Null
}

$composePath = Join-Path $runtime "docker-compose.yml"
if (Test-Path -LiteralPath $composePath) {
  if (-not (Test-Path -LiteralPath $stamp)) {
    throw "Existing Supabase runtime has no version stamp. Use the documented update workflow."
  }
  $stampContent = [System.IO.File]::ReadAllText($stamp)
  if ($stampContent -notmatch ("(?m)^ref=" + [regex]::Escape($snapshotRef) + "$")) {
    throw "Existing Supabase runtime is not stamped $snapshotRef. Use the documented update workflow."
  }
} else {
  if (Test-Path -LiteralPath $runtime) {
    throw "$runtime exists but is not a complete Supabase runtime."
  }

  $work = Join-Path $runtimeRoot ("bootstrap-" + [System.Guid]::NewGuid().ToString("N"))
  try {
    & $git.Source clone --quiet --depth 1 --branch $snapshotRef $repository $work
    if ($LASTEXITCODE -ne 0) {
      throw "Unable to clone the official Supabase snapshot."
    }
    $actualCommit = (& $git.Source -C $work rev-parse HEAD).Trim()
    if ($actualCommit -ne $snapshotCommit) {
      throw "$snapshotRef resolved to unexpected commit $actualCommit."
    }

    New-Item -ItemType Directory -Path $runtime | Out-Null
    Get-ChildItem -LiteralPath (Join-Path $work "docker") -Force | Copy-Item -Destination $runtime -Recurse -Force
    [System.IO.File]::WriteAllText($stamp, "ref=$snapshotRef`ncommit=$snapshotCommit`n", [System.Text.UTF8Encoding]::new($false))
  } finally {
    if (Test-Path -LiteralPath $work) {
      Remove-Item -LiteralPath $work -Recurse -Force
    }
  }
}

Push-Location $runtime
try {
  $envPath = Join-Path $runtime ".env"
  $createdEnv = $false
  if (-not (Test-Path -LiteralPath $envPath)) {
    Copy-Item -LiteralPath (Join-Path $runtime ".env.example") -Destination $envPath
    $createdEnv = $true
  }

  $envContent = [System.IO.File]::ReadAllText($envPath)
  if ($envContent -match "(?m)^POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password$" -or
      $envContent -match "(?m)^JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long$") {
    & $shellPath "utils/generate-keys.sh" "--update-env" | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "Official generate-keys.sh failed."
    }
  }

  $envContent = [System.IO.File]::ReadAllText($envPath)
  if ($envContent -notmatch "(?m)^SUPABASE_PUBLISHABLE_KEY=sb_publishable_") {
    $oldArgConversion = $env:MSYS2_ARG_CONV_EXCL
    try {
      $env:MSYS2_ARG_CONV_EXCL = "*"
      & $shellPath "utils/add-new-auth-keys.sh" "--update-env" | Out-Null
      if ($LASTEXITCODE -ne 0) {
        throw "Official add-new-auth-keys.sh failed."
      }
    } finally {
      $env:MSYS2_ARG_CONV_EXCL = $oldArgConversion
    }
  }

  $envContent = [System.IO.File]::ReadAllText($envPath)
  if ($envContent -notmatch "(?m)^MAINTENANCE_SECRET=.+$") {
    $maintenanceSecret = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).ToLowerInvariant()
    Set-EnvValue $envPath "MAINTENANCE_SECRET" $maintenanceSecret
  }

  if ($createdEnv) {
    Set-EnvValue $envPath "SUPABASE_PUBLIC_URL" "http://supabase.localhost:8000"
    Set-EnvValue $envPath "API_EXTERNAL_URL" "http://supabase.localhost:8000/auth/v1"
    Set-EnvValue $envPath "SITE_URL" "http://localhost:3000"
    Set-EnvValue $envPath "ADDITIONAL_REDIRECT_URLS" "http://localhost:3000/**"
    Set-EnvValue $envPath "POOLER_TENANT_ID" "padelku"
    Set-EnvValue $envPath "STORAGE_TENANT_ID" "padelku"
    Set-EnvValue $envPath "POSTGRES_DIRECT_PORT" "54322"
    Set-EnvValue $envPath "APP_PORT" "3000"
    Set-EnvValue $envPath "OPENAI_API_KEY" ""
  }

  Remove-Item -LiteralPath (Join-Path $runtime ".env.old") -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath (Join-Path $runtime "docker-compose.yml.old") -Force -ErrorAction SilentlyContinue
} finally {
  Pop-Location
}

"Supabase $snapshotRef is ready in .supabase/docker."
"Run: docker compose config --quiet"
"Then: docker compose up --build -d --wait"
