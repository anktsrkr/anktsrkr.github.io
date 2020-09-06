---
title: "Implementing Hub-Spoke network topology in Azure - Part 2" # Title of the blog post.
date: 2020-09-06T01:00:00+05:30 # Date of post creation.
description: "Article description." # Description used for search engine.
featured: false # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnail: "/images/azure.png" # Sets thumbnail image appearing inside card on homepage.
shareImage: "/images/path/share.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.
series : "Themes Guide"
categories:
  - Cloud
  - Azure architecture
tags:
  - Azure
  - Networking
---

Hi Everyone!

This post is continuation of how to series about Hub-Spoke network topology in Azure. Over the time, I will updated this page with links to individual posts : 

[Implementing Hub-Spoke network topology in Azure - Part 1](/post/implementing-hub-spoke-network-topology-in-azure-part1) 

_This Post - Implementing Hub-Spoke network topology in Azure - Part 2_ 

[Coming Soon - Introducing Azure Firewall in Hub-spoke network topology in Azure](#) 

[Coming Soon - Connect your Hub with your On-Prem](#) 

Now, we know the context of this topology and architecture let's start to implement it. In this post, I am going to use **azure portal** for creating the virtual networks and azure powershell module to create JumpBox in different virtual networks. 
 
We will start by creating Hub Virtual Network(`hub-vnet`), with address space `10.10.0.0/19`. We will also create a subnet `ManagementSubnet` under hub virtual network with address space `10.10.1.0/24`

![Overview of Hub VNet](/images/hub-spoke/overview_hub_vnet.jpg)

 Please note, I have selected DDoS protection plan as Basic, but it is highly recommended to enable DDoS protection plan for your production environment and this is applicable for all of your virtual networks.

Let's create Spoke 1 Virtual Network(`spoke1-vnet`), with address space `10.20.0.0/19`. We will also create a subnet `WorkloadSubnet` under Spoke1 virtual network with address space `10.20.1.0/24`

![Overview of Spoke 1 VNet](/images/hub-spoke/overview_spoke1_vnet.jpg)

Next create Spoke 2 Virtual Network(`spoke2-vnet`), with address space `10.30.0.0/19`. We will also create a subnet `WorkloadSubnet` under Spoke1 virtual network with address space `10.30.1.0/24`

![Overview of Spoke 2 VNet](/images/hub-spoke/overview_spoke2_vnet.jpg)

Two virtual networks can not talk to each other, so by default `hub-vnet` will not be able to connect with `spoke1-vnet` and `spoke2-vnet`. So, to make it work we need to enable vnet-peering between hub and spokes.

Let's create vnet peering between `hub-vnet to spoke1-vnet` and vice versa, also we need to same for spoke2 vnet : 

![hub-vnet to spoke1-vnet peering settings](/images/hub-spoke/hub-to-spoke1-peering.jpg)

![hub-vnet to spoke2-vnet peering settings](/images/hub-spoke/hub-to-spoke2-peering.jpg)

> **_NOTE:_**  You can also provide resource id if you do not have read access to the virtual network or subscription you wish to peer with.

Once done, peering status should show as connected :

![hub-vnet to spoke1-vnet peering connected](/images/hub-spoke/hub-to-spoke1-peering-connected.jpg)

The interesting part is I have created peering between hub and spokes but not between spoke1 and spoke2, so spoke1 and spoke2 can not communicate with each other. you can ask me, can't we create peering between them? Yes! you can but you should not, I will try to explain the reason in next part and will show you how communication will be done between spokes if needed.


Now for testing purpose, we are going to create JumpBox with IIS enabled in 3 different virtual networks. Out of which Hub JumpBox will only have pubic ip along with private ip and other two JumpBox will only have private ip. Below single script will be used to create different virtual machines. 

{{< highlight powershell >}}
$LocationName = Read-Host `
                    -Prompt 'Enter Location'
$ResourceGroupName = Read-Host `
                         -Prompt 'Enter Resource Group Name'

$VMName = Read-Host `
              -Prompt 'Enter Virtual Machine Name'
$ComputerName = $VMName
$VMSize = "Standard_B1ms"

$NetworkName = Read-Host `
                   -Prompt 'Enter Virtual Network Name'
$SubnetName = Read-Host `
                  -Prompt 'Enter Subnet Name'
 
$NICName = "$($VMName)-Nic"

$rdpRule = New-AzNetworkSecurityRuleConfig `
              -Name Rdp-Rule `
              -Description "Allow RDP" `
              -Access Allow `
              -Protocol Tcp `
              -Direction Inbound `
              -Priority 1000 `
              -SourceAddressPrefix Internet `
              -SourcePortRange * `
              -DestinationAddressPrefix * `
              -DestinationPortRange 3389

$networkSecurityGroup = New-AzNetworkSecurityGroup `
                           -ResourceGroupName $ResourceGroupName `
                           -Location $LocationName `
                           -Name "$($VMName)-Nsg" `
                           -SecurityRules $rdpRule

$Vnet = Get-AzVirtualNetwork `
            -Name $NetworkName
$SingleSubnet = Set-AzVirtualNetworkSubnetConfig `
                   -VirtualNetwork $Vnet `
                   -Name $SubnetName `
                   -NetworkSecurityGroup $networkSecurityGroup

$Vnet = Set-AzVirtualNetwork `
           -VirtualNetwork $VNET

$SingleSubnet = Get-AzVirtualNetworkSubnetConfig `
                   -VirtualNetwork $Vnet `
                   -Name $SubnetName `

$NIC = Get-AzNetworkInterface `
          -Name $NICName
$PipRequired = Read-Host `
                   -Prompt 'Do you want to enable public ip for this virtual machine? (Press Y to Yes)'

if($PipRequired -eq "Y"){
    $Pip = New-AzPublicIpAddress `
              -ResourceGroupName $ResourceGroupName `
              -Location $LocationName `
              -AllocationMethod Dynamic `
              -Sku Basic `
              -Name "$($VMName)-PublicIp"

$ipconfig = New-AzNetworkInterfaceIpConfig `
               -Name "$($VMName)-IpConfig" `
               -Subnet $SingleSubnet -PublicIpAddress $Pip
}
else {
$ipconfig = New-AzNetworkInterfaceIpConfig `
               -Name "$($VMName)-IpConfig" `
               -Subnet $SingleSubnet
}

$NIC = New-AzNetworkInterface `
          -Name $NICName `
          -ResourceGroupName $ResourceGroupName `
          -Location $LocationName `
          -IpConfiguration $ipconfig

$Credential = Get-Credential `
                 -Message "Enter a username and password for the virtual machine"

$VirtualMachine = New-AzVMConfig `
                     -VMName $VMName `
                     -VMSize $VMSize

$VirtualMachine = Set-AzVMBootDiagnostic `
                     -VM $VirtualMachine `
                     -Disable

$VirtualMachine = Set-AzVMOperatingSystem `
                     -VM $VirtualMachine `
                     -Windows `
                     -ComputerName $ComputerName `
                     -Credential $Credential `
                     -ProvisionVMAgent `
                     -EnableAutoUpdate

$VirtualMachine = Add-AzVMNetworkInterface `
                     -VM $VirtualMachine `
                     -Id $NIC.Id
$VirtualMachine = Set-AzVMSourceImage `
                     -VM $VirtualMachine `
                     -PublisherName 'MicrosoftWindowsServer' `
                     -Offer 'WindowsServer' `
                     -Skus '2019-Datacenter' `
                     -Version latest
$VirtualMachine = Set-AzVMOSDisk `
                     -VM $VirtualMachine `
                     -Name "$($VMName)-OsDisk" `
                     -StorageAccountType "Standard_LRS" `
                     -Windows `
                     -DiskSizeInGB 127 `
                     -CreateOption FromImage 

New-AzVM `
   -ResourceGroupName $ResourceGroupName `
   -Location $LocationName `
   -VM $VirtualMachine `
   -Verbose


# Install IIS
$PublicSettings = '{"commandToExecute":"powershell Add-WindowsFeature Web-Server"}'

Set-AzVMExtension `
        -ExtensionName "IIS" `
        -ResourceGroupName $ResourceGroupName `
        -VMName $VMName `
        -Publisher "Microsoft.Compute" `
        -ExtensionType "CustomScriptExtension" -TypeHandlerVersion 1.4 `
        -SettingString $PublicSettings -Location $LocationName
{{< /highlight >}}

Once completed, let's see how data flows between hub to spokes. 


#### Hub To Spokes

Since, we have established the peering between Hub and spokes, these spokes are reachable from hub.

![Spoke vnets are reachable from Hub vnet](/images/hub-spoke/hub-to-spokes-reachable.jpg)


#### Spokes To Hub

Hub is also reachable from both spokes.

![Hub vnet is reachable from Spoke 1 vnet](/images/hub-spoke/spoke1-to-hub-reachable.jpg)

![Hub vnet is reachable from Spoke 2 vnet](/images/hub-spoke/spoke2-to-hub-reachable.jpg)

#### Spoke To Spoke
Interesting! if you see the above screenshot, communication between spokes are not working. Why?  Let's discuss it in next post!

Here is the updated architecture, we just implemented - 


![Updated architecture](/images/hub-spoke/implemented-hub-spoke-topology.jpg)
