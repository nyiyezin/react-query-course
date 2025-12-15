import { useQuery } from "@tanstack/react-query";
import { defaultLabels } from "./defaultData";

export function useLabelsData() {
	return useQuery({
		queryKey: ["labels"],
		queryFn: async ({ signal }) => {
			const res = await fetch("/api/labels", { signal });

			return res.json();
		},
		staleTime: 1000 * 60 * 60,
		placeholderData: defaultLabels,
	});
}
