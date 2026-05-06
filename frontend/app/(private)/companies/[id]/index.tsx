import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Button, Card, Chip, Avatar } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  useCompany,
  useArchiveCompany,
  useRestoreCompany,
} from "../../../../hooks/use-companies";
import { useContacts } from "../../../../hooks/use-contacts";
import { ConfirmModal } from "../../../../components/shared/confirm-modal";
import { SectionDivider } from "../../../../components/shared/form/section-divider";
import { useToastMsg } from "../../../../hooks/use-toast-msg";
import type { Contact } from "../../../../types/contact";

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View className="w-8 h-8 rounded-lg bg-surface-secondary items-center justify-center">
        <Ionicons name={icon} size={16} color="#64748b" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-muted">{label}</Text>
        <Text className="text-sm text-foreground">{value}</Text>
      </View>
    </View>
  );
}

const statusLabel: Record<string, string> = {
  customer: "Client",
  prospect: "Prospect",
  archived: "Archive",
};

export default function CompanyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: company, isLoading: companyLoading } = useCompany(id);
  const { data: contacts, isLoading: contactsLoading } = useContacts(id);
  const archiveCompany = useArchiveCompany();
  const restoreCompany = useRestoreCompany();
  const toast = useToastMsg();

  const [target, setTarget] = useState<{
    type: "archive" | "restore";
    id: string;
    name: string;
  } | null>(null);

  if (companyLoading || !company) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView>
      <View className="gap-5 p-5 pb-10">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onPress={() => router.push("/companies")}
          >
            <Ionicons name="arrow-back" size={22} className="text-foreground" />
          </Button>
          <View style={{ flex: 1, gap: 4 }}>
            <Text className="text-2xl font-bold text-foreground">
              {company.name}
            </Text>
            <Chip
              size="sm"
              variant="soft"
              color={
                company.status === "customer"
                  ? "success"
                  : company.status === "prospect"
                    ? "accent"
                    : "default"
              }
            >
              <Chip.Label>{statusLabel[company.status]}</Chip.Label>
            </Chip>
          </View>
          {company.status !== "archived" ? (
            <Button
              size="sm"
              variant="ghost"
              onPress={() =>
                setTarget({
                  type: "archive",
                  id: company.id,
                  name: company.name,
                })
              }
            >
              <Ionicons name="archive-outline" size={18} color="#64748b" />
              <Button.Label>Archiver</Button.Label>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onPress={() =>
                setTarget({
                  type: "restore",
                  id: company.id,
                  name: company.name,
                })
              }
            >
              <Ionicons name="refresh-outline" size={16} color="#fff" />
              <Button.Label>Restaurer</Button.Label>
            </Button>
          )}
        </View>

        {/* Legal info */}
        <SectionDivider icon="business" label="Informations" />

        <Card>
          <Card.Body className="p-0 px-4">
            {company.siren && (
              <InfoRow
                icon="finger-print-outline"
                label="SIREN"
                value={company.siren}
              />
            )}
            {company.siret && (
              <InfoRow
                icon="finger-print"
                label="SIRET"
                value={company.siret}
              />
            )}
            {company.vatNumber && (
              <InfoRow
                icon="receipt-outline"
                label="N° TVA"
                value={company.vatNumber}
              />
            )}
            {company.industry && (
              <InfoRow
                icon="briefcase-outline"
                label="Secteur"
                value={company.industry}
              />
            )}
            {!company.siren &&
              !company.siret &&
              !company.vatNumber &&
              !company.industry && (
                <Text className="text-sm text-muted py-3">
                  Aucune information renseignee
                </Text>
              )}
          </Card.Body>
        </Card>

        {/* Address */}
        <SectionDivider icon="location" label="Adresse" />

        <Card>
          <Card.Body className="p-0 px-4">
            {company.billingStreet && (
              <InfoRow
                icon="home-outline"
                label="Rue"
                value={company.billingStreet}
              />
            )}
            {(company.billingCity || company.billingZipCode) && (
              <InfoRow
                icon="map-outline"
                label="Ville"
                value={[company.billingCity, company.billingZipCode]
                  .filter(Boolean)
                  .join(" ")}
              />
            )}
            {company.billingCountry && (
              <InfoRow
                icon="globe-outline"
                label="Pays"
                value={company.billingCountry.toUpperCase()}
              />
            )}
            {!company.billingStreet &&
              !company.billingCity &&
              !company.billingCountry && (
                <Text className="text-sm text-muted py-3">
                  Aucune adresse renseignee
                </Text>
              )}
          </Card.Body>
        </Card>

        {/* Contact info */}
        <SectionDivider icon="call" label="Contact" />

        <Card>
          <Card.Body className="p-0 px-4">
            {company.website && (
              <InfoRow
                icon="globe-outline"
                label="Site web"
                value={company.website}
              />
            )}
            {!company.website && (
              <Text className="text-sm text-muted py-3">
                Aucun contact renseigne
              </Text>
            )}
          </Card.Body>
        </Card>

        {/* Contacts */}
        <SectionDivider icon="people" label="Personnes a contacter" />

        {contactsLoading ? (
          <ActivityIndicator size="small" />
        ) : !contacts?.length ? (
          <Card>
            <Card.Body>
              <View className="items-center py-8 gap-3">
                <View className="w-12 h-12 rounded-2xl bg-surface-secondary items-center justify-center">
                  <Ionicons
                    name="person-add-outline"
                    size={22}
                    color="#94a3b8"
                  />
                </View>
                <Text className="text-sm text-muted text-center">
                  Aucune personne de contact
                </Text>
              </View>
            </Card.Body>
          </Card>
        ) : (
          contacts
            .filter((c) => c.status === "active")
            .map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))
        )}
      </View>
      </ScrollView>

      {company.status !== "archived" && (
        <View className="absolute bottom-6 right-6">
          <Button
            size="lg"
            variant="primary"
            className="rounded-full w-14 h-14 shadow-lg"
            isIconOnly
            onPress={() => router.push(`/companies/${id}/add-contact`)}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </Button>
        </View>
      )}

      {target && (
        <ConfirmModal
          open
          title={target.type === "archive" ? "Archiver" : "Restaurer"}
          message={
            target.type === "archive"
              ? `Voulez-vous archiver "${target.name}" ?`
              : `Voulez-vous restaurer "${target.name}" ?`
          }
          confirmLabel={target.type === "archive" ? "Archiver" : "Restaurer"}
          danger={target.type === "archive"}
          loading={archiveCompany.isPending || restoreCompany.isPending}
          onConfirm={async () => {
            const mut =
              target.type === "archive" ? archiveCompany : restoreCompany;
            try {
              await mut.mutateAsync(target.id);
              toast.success(target.type === "archive" ? "Entreprise archivee" : "Entreprise restauree");
            } catch {
              toast.error("Erreur", "Une erreur est survenue");
            }
            setTarget(null);
          }}
          onCancel={() => setTarget(null)}
        />
      )}
    </View>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`;

  return (
    <Card>
      <Card.Body>
        <View className="flex-row items-center gap-3">
          <Avatar size="sm" alt={`${contact.firstName} ${contact.lastName}`}>
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar>
          <View className="gap-0.5 flex-1">
            <Text className="text-sm font-medium text-foreground">
              {contact.firstName} {contact.lastName}
            </Text>
            {contact.jobTitle && (
              <Text className="text-xs text-muted">{contact.jobTitle}</Text>
            )}
          </View>
          <View className="items-end gap-1">
            {contact.email && (
              <Text className="text-xs text-muted" numberOfLines={1}>
                {contact.email}
              </Text>
            )}
            {contact.phone && (
              <Text className="text-xs text-muted" numberOfLines={1}>
                {contact.phone}
              </Text>
            )}
          </View>
        </View>
      </Card.Body>
    </Card>
  );
}
