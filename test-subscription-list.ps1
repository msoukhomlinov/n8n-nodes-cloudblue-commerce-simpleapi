# Test script for CloudBlue Connect Simple API subscription list

# Replace these with your actual credentials
$credentials = @{
  authUrl         = 'https://portal.intellectit.com.au/auth/realms/sr599/protocol/openid-connect' # Base auth URL
  apiUrl          = 'https://simpleapiprod.azure-api.net/marketplace'
  username        = 'SimpleAPI@intellectit.com.au.api'
  password        = 'ere*TJH@fan8chk5ftd'
  clientId        = '70217a74-3edc-4854-b202-f971ec3303b6'
  clientSecret    = 'WnxcVyzTnXHiN4ywH24a0hs6u4TRixPA'
  subscriptionKey = '5b4eb4fe46fa4b8c83bb7f3b21ef600f'
}

function Get-AuthToken {
  Write-Host "`n=== Getting Auth Token ==="

  # Construct the full auth URL by appending /token
  $authUrl = "$($credentials.authUrl)/token"
  Write-Host "Auth URL: $authUrl"

  # Prepare the request body
  $body = @{
    grant_type    = 'password'
    username      = $credentials.username
    password      = $credentials.password
    client_id     = $credentials.clientId
    client_secret = $credentials.clientSecret
    scope         = 'openid'
  }

  Write-Host "Auth Request Body: $($body | ConvertTo-Json)"

  try {
    # Convert body to URL-encoded format
    $bodyString = ($body.GetEnumerator() | ForEach-Object { "$([System.Web.HttpUtility]::UrlEncode($_.Key))=$([System.Web.HttpUtility]::UrlEncode($_.Value))" }) -join '&'

    # Prepare headers
    $headers = @{
      'Content-Type'    = 'application/x-www-form-urlencoded'
      'Accept'          = '*/*'
      'Accept-Encoding' = 'gzip, deflate, br'
    }

    Write-Host "`nMaking auth request..."
    $response = Invoke-RestMethod -Uri $authUrl -Method Post -Headers $headers -Body $bodyString -ContentType 'application/x-www-form-urlencoded'

    Write-Host "Auth successful!"
    return $response.access_token
  }
  catch {
    Write-Host "Auth Error: $_"
    Write-Host "Response: $($_.ErrorDetails.Message)"
    throw
  }
}

function Get-Subscriptions {
  param (
    [string]$token
  )

  Write-Host "`n=== Listing Subscriptions ==="
  $url = "$($credentials.apiUrl)/subscriptions?limit=10"
  Write-Host "Request URL: $url"

  $headers = @{
    'Content-Type'       = 'application/json'
    'Authorization'      = "Bearer $token"
    'X-Subscription-Key' = $credentials.subscriptionKey
  }

  Write-Host "Request Headers: $($headers | ConvertTo-Json)"

  try {
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    Write-Host "`nResponse Body: $($response | ConvertTo-Json -Depth 10)"
    return $response
  }
  catch {
    Write-Host "List Subscriptions Error: $_"
    Write-Host "Response: $($_.ErrorDetails.Message)"
    throw
  }
}

# Run the test
try {
  Write-Host "Starting test with credentials:"
  $credentialsDisplay = $credentials.Clone()
  $credentialsDisplay.password = "***HIDDEN***"
  $credentialsDisplay.clientSecret = "***HIDDEN***"
  $credentialsDisplay.subscriptionKey = "***HIDDEN***"
  Write-Host ($credentialsDisplay | ConvertTo-Json)

  $token = Get-AuthToken
  Write-Host "`nObtained Bearer Token: $token"

  Get-Subscriptions -token $token
}
catch {
  Write-Host "`nTest failed: $_" -ForegroundColor Red
}
