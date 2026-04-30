import React, { useState } from "react";

import { View, Text, Modal, Pressable, FlatList } from "react-native";

import {
  Calendar,
  toDateId,
  fromDateId,
} from "@marceloterreiro/flash-calendar";

import { TextField, Input, Label, FieldError } from "heroui-native";

import { Ionicons } from "@expo/vector-icons";

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function DatePickerField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (date: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [pickYear, setPickYear] = useState(false);

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - 2 + i,
  );

  const display = value
    ? new Date(value + "T00:00:00").toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  function prev() {
    setViewDate((d) => {
      const n = new Date(d);
      n.setMonth(n.getMonth() - 1);
      return n;
    });
  }

  function next() {
    setViewDate((d) => {
      const n = new Date(d);
      n.setMonth(n.getMonth() + 1);
      return n;
    });
  }

  return (
    <View>
      <TextField isInvalid={!!error}>
        <Label>{label}</Label>
        <Pressable
          onPress={() => {
            setViewDate(value ? fromDateId(value) : new Date());
            setPickYear(false);
            setOpen(true);
          }}
        >
          <Input
            pointerEvents="none"
            placeholder="Sélectionner une date"
            value={display}
            editable={false}
          />
        </Pressable>
        {error && <FieldError>{error}</FieldError>}
      </TextField>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center px-6"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="bg-white rounded-3xl p-5 w-full max-w-sm"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-gray-900">{label}</Text>
              <Pressable onPress={() => setOpen(false)}>
                <Text className="text-blue-600 font-semibold text-sm">
                  Fermer
                </Text>
              </Pressable>
            </View>

            <View className="flex-row items-center justify-between mb-4 px-1">
              <Pressable
                onPress={prev}
                className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="chevron-back" size={20} color="#374151" />
              </Pressable>
              <Pressable
                onPress={() => setPickYear(!pickYear)}
                className="px-3 py-1.5 rounded-full bg-gray-100"
              >
                <Text className="font-bold text-gray-800 text-sm">
                  {MONTHS_FR[viewDate.getMonth()]} {viewDate.getFullYear()}
                </Text>
              </Pressable>
              <Pressable
                onPress={next}
                className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="chevron-forward" size={20} color="#374151" />
              </Pressable>
            </View>

            {pickYear && (
              <View className="mb-3 max-h-32 rounded-2xl bg-gray-50 overflow-hidden">
                <FlatList
                  data={years}
                  keyExtractor={(y) => String(y)}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: year }) => (
                    <Pressable
                      onPress={() => {
                        setViewDate((d) => {
                          const n = new Date(d);
                          n.setFullYear(year);
                          return n;
                        });
                        setPickYear(false);
                      }}
                      className={`py-2.5 px-4 items-center ${year === viewDate.getFullYear() ? "bg-blue-500" : ""}`}
                    >
                      <Text
                        className={`font-semibold text-sm ${year === viewDate.getFullYear() ? "text-white" : "text-gray-700"}`}
                      >
                        {year}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            )}

            <Calendar
              calendarMonthId={toDateId(viewDate)}
              calendarActiveDateRanges={
                value ? [{ startId: value, endId: value }] : undefined
              }
              onCalendarDayPress={(id) => {
                onChange(id);
                setOpen(false);
              }}
              calendarColorScheme="light"
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
