import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIServiceMatcher from '@/components/AIServiceMatcher';
import IoTDeviceManager from '@/components/IoTDeviceManager';
import BlockchainPayments from '@/components/BlockchainPayments';
import ProviderCommunity from '@/components/ProviderCommunity';
import GamificationSystem from '@/components/GamificationSystem';

export default function FutureFeatures() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Future Features</h1>
        <p className="text-muted-foreground">
          Experience cutting-edge features powered by AI, IoT, Blockchain, and Social technologies
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai">AI Matching</TabsTrigger>
          <TabsTrigger value="iot">IoT Devices</TabsTrigger>
          <TabsTrigger value="blockchain">Crypto</TabsTrigger>
          <TabsTrigger value="social">Community</TabsTrigger>
          <TabsTrigger value="gamification">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-6">
          <AIServiceMatcher />
        </TabsContent>

        <TabsContent value="iot" className="mt-6">
          <IoTDeviceManager />
        </TabsContent>

        <TabsContent value="blockchain" className="mt-6">
          <BlockchainPayments />
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <ProviderCommunity />
        </TabsContent>

        <TabsContent value="gamification" className="mt-6">
          <GamificationSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
}