import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Bitcoin, ArrowUpRight, ArrowDownRight, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CryptoWallet {
  id: string;
  wallet_address: string;
  wallet_type: string;
  blockchain_network: string;
  is_verified: boolean;
  created_at: string;
}

interface BlockchainTransaction {
  id: string;
  booking_id?: string;
  transaction_hash: string;
  from_address: string;
  to_address: string;
  amount: number;
  currency: string;
  network: string;
  status: string;
  block_number?: number;
  gas_fee?: number;
  created_at: string;
  confirmed_at?: string;
}

export default function BlockchainPayments() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingWallet, setIsAddingWallet] = useState(false);

  const [newWallet, setNewWallet] = useState({
    wallet_address: '',
    wallet_type: 'metamask',
    blockchain_network: 'ethereum'
  });

  useEffect(() => {
    if (user) {
      loadWallets();
      loadTransactions();
    }
  }, [user]);

  const loadWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error loading wallets:', error);
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('blockchain_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const addWallet = async () => {
    try {
      // Validate wallet address format
      if (!newWallet.wallet_address || newWallet.wallet_address.length < 20) {
        toast.error('Please enter a valid wallet address');
        return;
      }

      const { error } = await supabase
        .from('crypto_wallets')
        .insert({
          user_id: user?.id,
          ...newWallet
        });

      if (error) throw error;

      setNewWallet({
        wallet_address: '',
        wallet_type: 'metamask',
        blockchain_network: 'ethereum'
      });
      setIsAddingWallet(false);
      await loadWallets();
      toast.success('Wallet added successfully');
    } catch (error) {
      console.error('Error adding wallet:', error);
      toast.error('Failed to add wallet');
    }
  };

  const verifyWallet = async (walletId: string) => {
    try {
      // In a real implementation, this would involve signing a message
      const { error } = await supabase
        .from('crypto_wallets')
        .update({ is_verified: true })
        .eq('id', walletId);

      if (error) throw error;
      await loadWallets();
      toast.success('Wallet verified successfully');
    } catch (error) {
      console.error('Error verifying wallet:', error);
      toast.error('Failed to verify wallet');
    }
  };

  const initiatePayment = async (bookingId: string, amount: number, currency: string) => {
    try {
      // This would integrate with actual blockchain networks
      const mockTransaction = {
        booking_id: bookingId,
        transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from_address: wallets[0]?.wallet_address || '0x...',
        to_address: '0xServiceProviderAddress',
        amount,
        currency,
        network: 'ethereum',
        status: 'pending'
      };

      const { error } = await supabase
        .from('blockchain_transactions')
        .insert(mockTransaction);

      if (error) throw error;
      await loadTransactions();
      toast.success('Payment initiated on blockchain');
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment');
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'bitcoin': return <Bitcoin className="h-5 w-5 text-orange-500" />;
      case 'ethereum': return <div className="h-5 w-5 bg-blue-500 rounded" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Blockchain Payments</h2>
        </div>
        <Dialog open={isAddingWallet} onOpenChange={setIsAddingWallet}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Crypto Wallet</DialogTitle>
              <DialogDescription>
                Connect your cryptocurrency wallet for payments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="wallet-address">Wallet Address</Label>
                <Input
                  id="wallet-address"
                  value={newWallet.wallet_address}
                  onChange={(e) => setNewWallet(prev => ({ ...prev, wallet_address: e.target.value }))}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label htmlFor="wallet-type">Wallet Type</Label>
                <Select
                  value={newWallet.wallet_type}
                  onValueChange={(value) => setNewWallet(prev => ({ ...prev, wallet_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metamask">MetaMask</SelectItem>
                    <SelectItem value="coinbase">Coinbase Wallet</SelectItem>
                    <SelectItem value="trust">Trust Wallet</SelectItem>
                    <SelectItem value="ledger">Ledger</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="network">Blockchain Network</Label>
                <Select
                  value={newWallet.blockchain_network}
                  onValueChange={(value) => setNewWallet(prev => ({ ...prev, blockchain_network: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="binance">Binance Smart Chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addWallet} className="w-full">
                Add Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="wallets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallets">My Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          {wallets.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No wallets connected yet. Add your first crypto wallet!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {wallets.map((wallet) => (
                <Card key={wallet.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getWalletIcon(wallet.blockchain_network)}
                        <CardTitle className="text-lg capitalize">
                          {wallet.wallet_type} Wallet
                        </CardTitle>
                      </div>
                      <Badge variant={wallet.is_verified ? 'default' : 'secondary'}>
                        {wallet.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {wallet.blockchain_network.toUpperCase()} Network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Address:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          {formatAddress(wallet.wallet_address)}
                        </code>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Added:</span>
                        <span>{new Date(wallet.created_at).toLocaleDateString()}</span>
                      </div>
                      {!wallet.is_verified && (
                        <Button 
                          size="sm" 
                          onClick={() => verifyWallet(wallet.id)}
                          className="w-full"
                        >
                          Verify Wallet
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <ArrowUpRight className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No blockchain transactions yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <Card key={tx.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <div>
                          <CardTitle className="text-lg">
                            {tx.amount} {tx.currency.toUpperCase()}
                          </CardTitle>
                          <CardDescription>
                            {tx.network.toUpperCase()} Transaction
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          tx.status === 'confirmed' ? 'default' : 
                          tx.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Transaction Hash:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {formatAddress(tx.transaction_hash)}
                        </code>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>From:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {formatAddress(tx.from_address)}
                        </code>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>To:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {formatAddress(tx.to_address)}
                        </code>
                      </div>
                      {tx.gas_fee && (
                        <div className="flex justify-between text-sm">
                          <span>Gas Fee:</span>
                          <span>{tx.gas_fee} ETH</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                      </div>
                      {tx.confirmed_at && (
                        <div className="flex justify-between text-sm">
                          <span>Confirmed:</span>
                          <span>{new Date(tx.confirmed_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Demo payment section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Blockchain Payment</CardTitle>
          <CardDescription>
            Simulate a blockchain payment for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={() => initiatePayment('demo-booking', 0.1, 'ETH')}
              disabled={wallets.length === 0}
            >
              Pay 0.1 ETH
            </Button>
            <Button 
              onClick={() => initiatePayment('demo-booking', 0.001, 'BTC')}
              variant="outline"
              disabled={wallets.length === 0}
            >
              Pay 0.001 BTC
            </Button>
          </div>
          {wallets.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Add a wallet first to enable payments
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}