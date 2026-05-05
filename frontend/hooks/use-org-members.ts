import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrgMemberService } from "../services/organization-member.service";
import type { OrgMemberRole } from "../types/organization-member";

const svc = new OrgMemberService();

export function useOrgMembers(orgId: string) {
  return useQuery({
    queryKey: ["org-members", orgId],
    queryFn: () => svc.list(orgId),
  });
}

export function useUpdateMemberRole(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: OrgMemberRole }) =>
      svc.updateRole(orgId, memberId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-members", orgId] }),
  });
}

export function useRemoveMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => svc.remove(orgId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-members", orgId] }),
  });
}
