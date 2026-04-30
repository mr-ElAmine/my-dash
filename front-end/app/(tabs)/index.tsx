import React from "react";

import { View, Text, ScrollView } from "react-native";

import { Card, Chip, Surface } from "heroui-native";

import { Ionicons } from "@expo/vector-icons";

export default function Dashboard() {
  const stats = [
    {
      label: "Chiffre d'Affaires",
      value: "12 450,00 €",
      icon: "stats-chart-outline",
      color: "#3b82f6",
      trend: "+12%",
      trendColor: "#10b981",
    },
    {
      label: "Devis Signés",
      value: "8",
      icon: "checkmark-circle-outline",
      color: "#10b981",
      trend: "+2",
      trendColor: "#10b981",
    },
    {
      label: "Factures en attente",
      value: "3",
      icon: "time-outline",
      color: "#f59e0b",
      trend: "-1",
      trendColor: "#ef4444",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      title: "Devis DEV-2026-004",
      client: "Acme Corp",
      status: "accepté",
      date: "Aujourd'hui",
      amount: "1 200 €",
    },
    {
      id: 2,
      title: "Facture FAC-2026-002",
      client: "Stark Ind.",
      status: "envoyée",
      date: "Hier",
      amount: "3 500 €",
    },
    {
      id: 3,
      title: "Devis DEV-2026-005",
      client: "Wayne Ent.",
      status: "brouillon",
      date: "27 Avr.",
      amount: "850 €",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View className="p-6 pt-12">
        <View className="mb-8">
          <Text className="text-gray-500 font-medium">Bon retour, Marie !</Text>
          <Text className="text-3xl font-black text-gray-900">Dashboard</Text>
        </View>

        <View className="flex-row flex-wrap gap-4 mb-8">
          {stats.map((stat, index) => (
            <Surface
              key={index}
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex-1 min-w-[45%]"
            >
              <View className="bg-gray-50 self-start p-2 rounded-xl mb-3">
                <Ionicons
                  name={stat.icon as any}
                  size={24}
                  color={stat.color}
                />
              </View>
              <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                {stat.label}
              </Text>
              <Text className="text-xl font-black text-gray-900 mb-2">
                {stat.value}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="arrow-up" size={12} color={stat.trendColor} />
                <Text
                  style={{ color: stat.trendColor }}
                  className="text-xs font-bold ml-1"
                >
                  {stat.trend} ce mois
                </Text>
              </View>
            </Surface>
          ))}
        </View>

        <Surface className="bg-blue-600 p-6 rounded-3xl shadow-xl mb-8 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-blue-100 font-bold mb-1">
              Prêt pour une nouvelle vente ?
            </Text>
            <Text className="text-white text-lg font-black">
              Créer un nouveau devis
            </Text>
          </View>
          <View className="bg-white/20 p-3 rounded-full">
            <Ionicons name="add" size={32} color="white" />
          </View>
        </Surface>

        <View className="mb-4 flex-row justify-between items-end px-2">
          <Text className="text-xl font-black text-gray-900">
            Activité Récente
          </Text>
          <Text className="text-blue-600 font-bold">Voir tout</Text>
        </View>

        {recentActivity.map((activity) => (
          <Card
            key={activity.id}
            className="mb-4 border border-gray-100 shadow-sm"
          >
            <Card.Body className="p-4 flex-row items-center gap-4">
              <View className="bg-gray-100 p-3 rounded-2xl">
                <Ionicons
                  name={
                    activity.title.includes("Devis")
                      ? "document-text"
                      : "receipt"
                  }
                  size={24}
                  color="#4b5563"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-black text-gray-900">
                    {activity.title}
                  </Text>
                  <Text className="font-bold text-blue-600">
                    {activity.amount}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-500 text-sm">
                    {activity.client} • {activity.date}
                  </Text>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      activity.status === "accepté"
                        ? "success"
                        : activity.status === "envoyée"
                          ? "primary"
                          : "default"
                    }
                  >
                    <Chip.Label className="capitalize">
                      {activity.status}
                    </Chip.Label>
                  </Chip>
                </View>
              </View>
            </Card.Body>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
