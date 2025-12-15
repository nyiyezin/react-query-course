import { GoGear } from "react-icons/go";
import { useState } from "react";
import { useLabelsData } from "../helpers/useLabelsData";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function IssueLabels({ labels, issueNumber }) {
	const labelsQuery = useLabelsData();
	const [menuOpen, setMenuOpen] = useState(false);
	const queryClient = useQueryClient();

	const setLabels = useMutation({
		mutationFn: async (labelId) => {
			const newLabels = labels.includes(labelId)
				? labels.filter((l) => l !== labelId)
				: [...labels, labelId];

			const res = await fetch(`/api/issues/${issueNumber}`, {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ labels: newLabels }),
			});

			return res.json();
		},
		onMutate: async (labelId) => {
			await queryClient.cancelQueries({
				queryKey: ["issues", issueNumber],
			});

			const previousIssue = queryClient.getQueryData(["issues", issueNumber]);
			const oldLabels = previousIssue?.labels || [];

			const newLabels = oldLabels.includes(labelId)
				? oldLabels.filter((l) => l !== labelId)
				: [...oldLabels, labelId];

			queryClient.setQueryData(["issues", issueNumber], (old) => ({
				...old,
				labels: newLabels,
			}));

			return { previousIssue };
		},
		onError: (_err, _labelId, context) => {
			if (context?.previousIssue) {
				queryClient.setQueryData(["issues", issueNumber], context.previousIssue);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["issues", issueNumber],
				exact: true,
			});
		},
	});

	return (
		<div className="issue-options">
			<div>
				<span>Labels</span>
				{labelsQuery.isPending
					? null
					: labels.map((label) => {
							const labelObject = labelsQuery.data.find((l) => l.id === label);
							if (!labelObject) return null;
							return (
								<span key={label} className={`label ${labelObject.color}`}>
									{labelObject.name}
								</span>
							);
						})}
			</div>

			<GoGear onClick={() => !labelsQuery.isPending && setMenuOpen((open) => !open)} />

			{menuOpen && (
				<div className="picker-menu labels">
					{labelsQuery.data?.map((label) => {
						const selected = labels.includes(label.id);
						return (
							<div
								key={label.id}
								className={selected ? "selected" : ""}
								onClick={() => setLabels.mutate(label.id)}
							>
								<span className="label-dot" style={{ backgroundColor: label.color }}></span>
								{label.name}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
