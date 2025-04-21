# n8n-nodes-cloudblue-commerce-simpleapi

![n8n-nodes-cloudblue-commerce-simpleapi](https://img.shields.io/badge/n8n--nodes--cloudblue--commerce--simpleapi-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow.svg)](https://buymeacoffee.com/maxs)

This is an n8n community node for CloudBlue Commerce SimpleAPI. It provides a robust interface to interact with CloudBlue Commerce services via n8n.

[Installation](#installation)
[Credentials](#credentials)
[Usage](#usage)
[Features](#features)
[Error Handling](#error-handling)
[Support](#support)
[License](#license)

## Features

- **Resource Support**:
  - Customers: Create, Get, List, Update
  - Orders: Get, List, Create, Update, Estimate Price
  - Service Plans: Get, List
  - Subscriptions: Get, List, Update

- **Advanced Features**:
  - Comprehensive error handling with correlation IDs
  - Automatic pagination support for list operations
  - Advanced filtering capabilities with date range support
  - Input validation through dedicated validators
  - Detailed logging and debugging support
  - Singleton pattern for consistent API state management

## Installation

Follow these steps to install this node:

1. Open your n8n instance
2. Go to Settings > Community Nodes
3. Click "Install"
4. Enter `n8n-nodes-cloudblue-commerce-simpleapi`
5. Reload n8n

## Credentials

You need to configure the following credentials:

- **Auth URL**: The URL of the CloudBlue Commerce SimpleAPI authentication endpoint
  - Format: `https://[your fqdn]/auth/realms/[your sr number]/protocol/openid-connect`
  - Required for OAuth2 authentication

- **API URL**: The URL of the CloudBlue Commerce SimpleAPI service API for making actual API calls
  - Default: `https://simpleapiprod.azure-api.net/marketplace`
  - Required for all API operations

- **Username**: The username from your CloudBlue Commerce > MarketplaceAPI
  - This is your MarketplaceAPI specific username

- **Password**: The password for your MarketplaceAPI user
  - Can be found in classic panel > users section

- **Client ID**: The client ID for OAuth2 authentication
  - Provided by your CloudBlue account manager
  - Required for OAuth2 authentication flow

- **Client Secret**: The client secret for OAuth2 authentication
  - Provided by your CloudBlue account manager
  - Required for OAuth2 authentication flow
  - Keep this secure and never share it

- **Subscription Key**: Password from your CloudBlue Commerce > MarketplaceAPI
  - Required for API access
  - Keep this secure and never share it

## Usage

### Customer Operations

1. **Create Customer**
   - Add required customer details
   - Configure contact information
   - Set address details

2. **Get Customer**
   - Retrieve by customer ID
   - Access detailed customer information

3. **List Customers**
   - Filter by various parameters
   - Pagination support
   - Return all or limit results

4. **Update Customer**
   - Modify customer details
   - Update contact information
   - Change address details

### Order Operations

1. **Create Order**
   - Specify order details
   - Add line items
   - Set customer information

2. **Get Order**
   - Retrieve by order ID
   - Access complete order details

3. **List Orders**
   - Filter by date range
   - Advanced filtering options
   - Pagination support

4. **Update Order**
   - Modify order properties
   - Update order status
   - Adjust line items

5. **Estimate Price**
   - Get price estimates for orders
   - Calculate costs before creation

### Plan Operations

1. **Get Service Plan**
   - Retrieve by plan ID
   - Access detailed plan information

2. **List Service Plans**
   - Filter available plans
   - Pagination support
   - View plan details

### Subscription Operations

1. **Get Subscription**
   - Retrieve by subscription ID
   - Access subscription details

2. **List Subscriptions**
   - Filter active subscriptions
   - Pagination support
   - Advanced filtering

3. **Update Subscription**
   - Modify subscription properties
   - Update subscription status

## Error Handling

The node implements comprehensive error handling with:

- Correlation IDs for tracking requests
- Detailed error messages
- HTTP status code mapping
- Automatic retry logic for transient errors
- Rate limit handling

## Support

- [CloudBlue Commerce Documentation](https://docs.cloudblue.com/cbc/21.0/Simple-API/how-to-use/howto/)
- [GitHub Issues](https://github.com/msoukhomlinov/n8n-nodes-cloudblue-commerce-simpleapi/issues)

If you find this node helpful and would like to support its development:

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/maxs)

## License

[MIT](LICENSE)
