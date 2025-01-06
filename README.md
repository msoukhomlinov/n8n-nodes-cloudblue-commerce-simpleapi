# n8n-nodes-cloudblue-connect-simpleapi

This is an n8n community node for CloudBlue Connect SimpleAPI. It provides a simple interface to interact with CloudBlue Connect services via n8n.

## Features

- **Resource Support**:
  - Products: List, Get, Create, Update
  - Subscriptions: List, Get, Create, Update
  - Orders: List, Get, Create, Update
  - Marketplaces: List, Get, Create, Update

- **Advanced Features**:
  - Response Caching with automatic invalidation
  - Client-side validation
  - Hierarchical resource selection
  - Pagination support
  - Error handling with retry logic

## Installation

Follow these steps to install this node:

```bash
# Install from npm
npm install n8n-nodes-cloudblue-connect-simpleapi

# Or install from source
npm install <path-to-repo>
```

## Configuration

1. Open your n8n instance
2. Go to Settings > Community Nodes
3. Click "Install"
4. Enter `n8n-nodes-cloudblue-connect-simpleapi`
5. Reload n8n

## Credentials

You need to configure the following credentials:

- **API URL**: Your CloudBlue Connect SimpleAPI endpoint
- **API Token**: Your API authentication token
- **Cache Settings** (optional):
  - Enable/disable response caching
  - Cache TTL in seconds
  - Maximum cache size

## Usage

1. Add the "CloudBlue Connect Simple API" node to your workflow
2. Select the resource type (Product, Subscription, Order, Marketplace)
3. Choose the operation (List, Get, Create, Update)
4. Configure operation-specific parameters
5. Connect to other nodes as needed

### Example: List Products

1. Add the node
2. Select "Product" as resource
3. Choose "List" operation
4. Optionally set:
   - Return All: true/false
   - Max Records: number of records to return

### Example: Create Subscription

1. Add the node
2. Select "Subscription" as resource
3. Choose "Create" operation
4. Select:
   - Product ID (dynamically loaded)
   - Marketplace ID (dynamically loaded)
5. Configure subscription details

## Support

- [CloudBlue Connect Documentation](https://docs.cloudblue.com/cbc/21.0/Simple-API/how-to-use/howto/)
- [GitHub Issues](https://github.com/msoukhomlinov/n8n-nodes-cloudblue-connect-simpleapi/issues)

## License

[MIT](LICENSE) 