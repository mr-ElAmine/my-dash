import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { Card, Chip, Button, Spinner } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetInvoices } from '../../hooks/useGetInvoices';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import { useStoragePermission } from '../../hooks/useStoragePermission';
import { getInvoicePdf } from '../../api/pdf';
import { Invoice } from '../../api/invoices';

export default function InvoicesScreen() {
  const router = useRouter();
  const { invoices, isLoading, isRefetching, refetch, error } = useGetInvoices();
  const { download, loading: downloading } = usePdfDownload();
  const { granted: hasPermission } = useStoragePermission();

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'success' as const;
      case 'sent': return 'accent' as const;
      case 'overdue': return 'danger' as const;
      case 'cancelled': return 'default' as const;
      case 'to_send': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  const getStatusLabel = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'sent': return 'Envoyée';
      case 'overdue': return 'En retard';
      case 'cancelled': return 'Annulée';
      case 'to_send': return 'À envoyer';
      default: return status;
    }
  };

  const handleDownload = (invoice: Invoice) => {
    download({
      fetchFn: getInvoicePdf,
      id: invoice.id,
      filename: `${invoice.invoiceNumber ?? 'facture'}.pdf`,
      hasStoragePermission: hasPermission,
    });
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <Card className="mb-4 mx-4 border border-gray-100 shadow-sm">
      <Card.Body className="p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              {item.invoiceNumber ?? '—'}
            </Text>
            <Text className="text-lg font-bold text-gray-900 mt-1">
              {item.company.name}
            </Text>
          </View>
          <Chip color={getStatusColor(item.status)} variant="soft" size="sm">
            <Chip.Label>{getStatusLabel(item.status)}</Chip.Label>
          </Chip>
        </View>

        <View className="flex-row items-center mb-1">
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text className="text-gray-500 text-xs ml-1">
            Émise le {new Date(item.issueDate).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View className="flex-row items-center mb-4">
          <Ionicons name="alarm-outline" size={14} color="#6b7280" />
          <Text className="text-gray-500 text-xs ml-1">
            Échéance {new Date(item.dueDate).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        <View className="h-[1px] bg-gray-100 w-full mb-4" />

        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-gray-400 text-[10px] uppercase font-bold">Total TTC</Text>
            <Text className="text-xl font-black text-blue-600">
              {item.totalTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <Button
              variant="light"
              className="bg-blue-50 h-12 w-12 rounded-full items-center justify-center p-0"
              onPress={() => router.push(`/invoices/${item.id}`)}
            >
              <Ionicons name="eye-outline" size={22} color="#3b82f6" />
            </Button>

            <Button
            className="bg-gray-900 h-12 w-12 rounded-full items-center justify-center p-0"
            onPress={() => handleDownload(item)}
          >
            <Ionicons name="download-outline" size={22} color="white" />
            </Button>
          </View>
        </View>
      </Card.Body>
    </Card>
  );

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Spinner size="lg" />
        <Text className="mt-4 text-gray-500 font-medium">Chargement des factures...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-10">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-lg font-bold text-gray-900 text-center">Erreur de données</Text>
        <Text className="text-gray-500 text-center mt-2">
          Impossible de récupérer les factures. Vérifiez votre connexion.
        </Text>
        <Button className="mt-6 bg-blue-600" onPress={() => refetch()}>
          <Text className="text-white font-bold">Réessayer</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-12">
      <View className="px-6 mb-6">
        <Text className="text-3xl font-black text-gray-900">Factures</Text>
        <Text className="text-gray-500 font-medium">Suivez vos paiements</Text>
      </View>

      <FlatList
        data={invoices}
        renderItem={renderInvoice}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#3b82f6" />
        }
        ListEmptyComponent={
          <View className="mt-20 items-center px-10">
            <View className="bg-gray-100 p-6 rounded-full mb-4">
              <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">Aucune facture</Text>
            <Text className="text-gray-500 text-center mt-2">
              Les factures apparaîtront automatiquement quand un devis sera accepté.
            </Text>
          </View>
        }
      />
    </View>
  );
}
