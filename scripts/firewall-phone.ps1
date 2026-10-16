param([switch]$Remover)
$ErrorActionPreference = 'Stop'
$samahiRoot = Split-Path -Parent $PSScriptRoot
$samahiConfigPath = Join-Path $samahiRoot 'entregas\teste-app\rede.json'
$samahiNames = @('SAMAHI-Teste-App-Backend', 'SAMAHI-Teste-App-Expo')
if ($Remover) {
  foreach ($samahiName in $samahiNames) { Get-NetFirewallRule -Name $samahiName -ErrorAction SilentlyContinue | Remove-NetFirewallRule }
  Write-Host 'Regras especificas do teste SAMAHI removidas.'
  exit
}
if (!(Test-Path -LiteralPath $samahiConfigPath)) { throw 'Execute Iniciar-App-Integrado.cmd primeiro para escolher a rede.' }
$samahiConfig = Get-Content -LiteralPath $samahiConfigPath -Raw | ConvertFrom-Json
if ($samahiConfig.host -notmatch '^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)') { throw 'A configuracao exige um IPv4 privado.' }
$samahiInterface = Get-NetIPAddress -AddressFamily IPv4 -IPAddress $samahiConfig.host -ErrorAction Stop
if (!(Test-Path -LiteralPath $samahiConfig.node)) { throw 'Executavel Node nao encontrado.' }
for ($samahiIndex = 0; $samahiIndex -lt 2; $samahiIndex++) {
  $samahiName = $samahiNames[$samahiIndex]
  $samahiPort = @(3002, 8082)[$samahiIndex]
  Get-NetFirewallRule -Name $samahiName -ErrorAction SilentlyContinue | Remove-NetFirewallRule
  New-NetFirewallRule -Name $samahiName -DisplayName $samahiName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $samahiPort -LocalAddress $samahiConfig.host -RemoteAddress LocalSubnet -InterfaceAlias $samahiInterface.InterfaceAlias -Program $samahiConfig.node -Profile Any | Out-Null
}
Write-Host "Acesso liberado somente na sub-rede local, pelo IP $($samahiConfig.host), nas portas 3002 e 8082."
Write-Host 'O firewall continua ativo. O editor Node-RED nao foi exposto.'
