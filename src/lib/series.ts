export interface SeriesItem {
  title: string;
  href: string;
}

export interface PostSeries {
  title: string;
  description: string;
  items: SeriesItem[];
}

const seriesByTitle: Record<string, PostSeries> = {
  'Semantic Kernel': {
    title: 'Semantic Kernel',
    description: 'Read the posts in this Semantic Kernel learning path.',
    items: [
      {
        title: 'Getting Started with Semantic Kernel (Part 1)',
        href: '/post/getting-started-with-semantic-kernel/'
      },
      {
        title: 'Getting Started with Semantic Kernel (Part 2)',
        href: '/post/getting-started-with-semantic-kernel-pt-2/'
      },
      {
        title: 'Building Blocks of Semantic Kernel',
        href: '/post/semantic-kernel/semantic-kernel-building-blocks/'
      },
      {
        title: 'Getting Started with Foundry Local & Semantic Kernel',
        href: '/post/semantic-kernel/getting-started-with-foundry-local-and-semantic-kernel/'
      },
      {
        title: 'Getting Started with Ollama & Semantic Kernel',
        href: '/post/semantic-kernel/getting-started-with-ollama-and-semantic-kernel/'
      },
      {
        title: 'Getting Started with LMStudio & Semantic Kernel',
        href: '/post/semantic-kernel/getting-started-with-lmstudio-and-semantic-kernel/'
      }
    ]
  },
  'Hub-Spoke network topology in Azure': {
    title: 'Hub-Spoke network topology in Azure',
    description: 'Follow the complete Hub-Spoke networking series in order.',
    items: [
      {
        title: 'Connect an on-premises network to a Microsoft Azure - Part 1',
        href: '/post/connect-azure-with-your-on-prem-network-part-1/'
      },
      {
        title: 'Connect an on-premises network to a Microsoft Azure - Part 2',
        href: '/post/connect-azure-with-your-on-prem-network-part-2/'
      },
      {
        title: 'Implementing Hub-Spoke network topology in Azure - Part 1',
        href: '/post/implementing-hub-spoke-network-topology-in-azure-part-1/'
      },
      {
        title: 'Implementing Hub-Spoke network topology in Azure - Part 2',
        href: '/post/implementing-hub-spoke-network-topology-in-azure-part-2/'
      },
      {
        title: 'Introducing Azure Firewall in Hub-Spoke network topology in Azure',
        href: '/post/introducing-azure-firewall-in-hub-spoke-network-topology-in-azure/'
      },
      {
        title: 'Implementing Azure Firewall in Hub-Spoke network topology in Azure',
        href: '/post/implementing-azure-firewall-in-hub-spoke-network-topology-in-azure/'
      }
    ]
  },
  'Azure Internal DNS': {
    title: 'Azure Internal DNS',
    description: 'Follow the Azure private DNS and private endpoint posts in order.',
    items: [
      {
        title: 'Resolve Azure Internal DNS from your on prem network and Spokes vnet',
        href: '/post/resolve-azure-internal-dns-from-your-on-prem-network/'
      },
      {
        title: 'Connect privately to Azure PaaS resources using Azure Private Endpoint from on-prem',
        href: '/post/connect-privately-to-azure-paas-resources-using-azure-private-endpoint/'
      }
    ]
  },
  'App Service Environment': {
    title: 'App Service Environment',
    description: 'Follow the App Service Environment posts from ASE setup through private networking and custom domains.',
    items: [
      {
        title: 'Deploy App Service Environment (ASE v2) in Microsoft Azure',
        href: '/post/deploy-app-service-environment-v2-in-microsoft-azure/'
      },
      {
        title: 'Create a WebApp in App Service Environment',
        href: '/post/create-a-webapp-in-app-service-environment/'
      },
      {
        title: 'Access App Service Environment Hosted WebApp from Azure Network and from On-Prem',
        href: '/post/access-app-service-environment-hosted-webapp-from-azure-network-and-from-on-prem/'
      },
      {
        title: 'Deploy a WebApp with Azure Sql in App Service Environment using Managed Identity and Private endpoint',
        href: '/post/deploy-a-webapp-with-azure-sql-in-app-service-environment-using-managed-identity-and-private-endpoint/'
      },
      {
        title: 'Add Custom Domain for App Service Environment Hosted WebApp',
        href: '/post/add-custom-domain-for-app-service-environment-hosted-webapp/'
      }
    ]
  },
  Nuke: {
    title: 'Nuke',
    description: 'Follow the Nuke build automation series in order.',
    items: [
      {
        title: 'Getting Started with Nuke',
        href: '/post/getting-started-with-nuke/'
      },
      {
        title: 'Write your first building block in Nuke',
        href: '/post/write-your-first-building-block-in-nuke/'
      },
      {
        title: 'Manage your Package Version using Nuke',
        href: '/post/manage-your-package-version-using-nuke/'
      },
      {
        title: 'Manage your Package Release using Nuke in Github',
        href: '/post/manage-your-package-release-using-nuke-in-github/'
      }
    ]
  },
  'Azure Blob Storage Testing': {
    title: 'Azure Blob Storage Testing',
    description: 'Follow the Azure Blob Storage testing series from dependency injection to unit and integration tests.',
    items: [
      {
        title: 'Getting started with testing for Azure Blob Storage : Dependency Injection',
        href: '/post/getting-started-with-testing-for-azure-blob-storage-dependency-injection/'
      },
      {
        title: 'Getting started with testing for Azure Blob Storage : Unit Test with help of Moq',
        href: '/post/getting-started-with-testing-for-azure-blob-storage-unit-test-moq/'
      },
      {
        title: 'Getting started with testing for Azure Blob Storage : Unit Test with help of FakeItEasy',
        href: '/post/getting-started-with-testing-for-azure-blob-storage-unit-test-fakeiteasy/'
      },
      {
        title: 'Getting started with testing for Azure Blob Storage : Integration Test with help of TestContainers and Azurite',
        href: '/post/getting-started-with-testing-for-azure-blob-storage-integration-test-testcontainers-azurite/'
      },
      {
        title: 'Getting started with testing for Azure Blob Storage : Mocking Azure Blob/File Storage SDK',
        href: '/post/getting-started-with-testing-for-azure-blob-storage-mocking-blob-storage-sdk/'
      },
      {
        title: 'Getting started with testing for Azure Blob Storage : Mocking Azure Blob/File Storage SDK Using FakeItEasy',
        href: '/post/getting-started-with-testing-for-azure-blob-storage-mocking-blob-storage-sdk-fakeiteasy/'
      }
    ]
  },
  'Polly v8 and HttpClientFactory': {
    title: 'Polly v8 and HttpClientFactory',
    description: 'Follow the Polly v8 and .NET HttpClientFactory resilience posts in order.',
    items: [
      {
        title: 'Implementing Retry Strategy using HttpClientFactory with Polly(v8) and .NET 8',
        href: '/post/implementing-retry-strategy-using-httpclientfactory-with-pollyv8-and-.net-8/'
      },
      {
        title: 'Re-Authorize Efficiently Using Polly And .NET HttpClientFactory in .NET 8',
        href: '/post/re-authorize-efficiently-using-polly-and-httpclientfactory-in-.net8/'
      }
    ]
  }
};

export function getPostSeries(seriesTitle?: string): PostSeries | undefined {
  return seriesTitle ? seriesByTitle[seriesTitle] : undefined;
}
