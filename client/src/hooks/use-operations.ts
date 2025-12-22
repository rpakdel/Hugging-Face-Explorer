import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertOperation } from "@shared/routes";

export function useOperations() {
  return useQuery({
    queryKey: [api.operations.list.path],
    queryFn: async () => {
      const res = await fetch(api.operations.list.path);
      if (!res.ok) throw new Error("Failed to fetch operations history");
      return api.operations.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertOperation) => {
      const res = await fetch(api.operations.create.path, {
        method: api.operations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Invalid request");
        }
        throw new Error("Failed to save operation");
      }
      
      return api.operations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.operations.list.path] });
    },
  });
}
