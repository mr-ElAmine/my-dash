import React from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { Card, Chip, Button, Spinner } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetQuotes } from '../../hooks/useGetQuotes';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import { useStoragePermission } from '../../hooks/useStoragePermission';
import { getQuotePdf } from '../../api/pdf';
import { Quote } from '../../api/quotes';

export default function QuotesScreen() {
  const router = useRouter();
  // on récupère les devis et l'etat de l'application
  const { quotes, isLoading, isRefetching, refetch, error } = useGetQuotes();
  const { download, loading: downloadingId } = usePdfDownload();
  const { granted: hasPermission } = useStoragePermission();

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'accepted': return 'success' as const;
      case 'sent': return 'primary' as const;
      case 'refused': return 'danger' as const;
      case 'expired': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  const getStatusLabel = (status: Quote['status']) => {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'sent': return 'Envoyé';
      case 'refused': return 'Refusé';
      case 'expired': return 'Expiré';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  //on definit la fonction qui va appeler le hook de téléchargement du pdf 
  const handleDownload = (quote: Quote) => {
    download({
      fetchFn: getQuotePdf,
      id: quote.id,
      filename: `${quote.quoteNumber}.pdf`,
      hasStoragePermission: hasPermission,
    });
  };


  // on définit la fonction du rendu de la card 
  const renderQuote = ({ item }: { item: Quote }) => (
    <Card className="mb-4 mx-4 border border-gray-100 shadow-sm">
      <Card.Body className="p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              {item.quoteNumber}
            </Text>
            <Text className="text-lg font-bold text-gray-900 mt-1">
              {item.company.name}
            </Text>
          </View>
          <Chip color={getStatusColor(item.status)} variant="flat" size="sm">
            <Chip.Label>{getStatusLabel(item.status)}</Chip.Label>
          </Chip>
        </View>

        <View className="flex-row items-center mb-4">
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text className="text-gray-500 text-xs ml-1">
            Émis le {new Date(item.issueDate).toLocaleDateString('fr-FR')}
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
              onPress={() => router.push(`/(tabs)/quotes/${item.id}`)}
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

  // Affichage d'un écran spinner si les données sont en chargement 

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Spinner size="lg" />
        <Text className="mt-4 text-gray-500 font-medium">Chargement des devis...</Text>
      </View>
    );
  }

  // si la récupération des données échoue on met un message d'erreur
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-10">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-lg font-bold text-gray-900 text-center">Erreur de données</Text>
        <Text className="text-gray-500 text-center mt-2">
          Impossible de récupérer les devis. Vérifiez votre connexion.
        </Text>
        <Button className="mt-6 bg-blue-600" onPress={() => refetch()}>
          <Text className="text-white font-bold">Réessayer</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-12">
      <View className="px-6 mb-6 flex-row justify-between items-end">
        <View>
          <Text className="text-3xl font-black text-gray-900">Devis</Text>
          <Text className="text-gray-500 font-medium">Gérez vos propositions</Text>
        </View>
        <Button 
          variant="solid" 
          className="bg-blue-600 rounded-full h-12 w-12 items-center justify-center p-0"
          onPress={() => router.push('/quotes/new')}
        >
          <Ionicons name="add" size={28} color="white" />
        </Button>
      </View>

      <FlatList
        data={quotes}
        renderItem={renderQuote}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#3b82f6" />
        }
        ListEmptyComponent={
          <View className="mt-20 items-center px-10">
            <View className="bg-gray-100 p-6 rounded-full mb-4">
              <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">Aucun devis</Text>
            <Text className="text-gray-500 text-center mt-2">
              Commencez par créer votre premier devis pour votre client.
            </Text>
          </View>
        }
      />
    </View>
  );
}
