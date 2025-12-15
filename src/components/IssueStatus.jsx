import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusSelect } from "./StatusSelect";

export default function IssueStatus({ status, issueNumber }) {
	const queryClient = useQueryClient();

	const setStatus = useMutation({
		mutationFn: async (status) => {
			const res = await fetch(`/api/issues/${issueNumber}`, {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ status }),
			});

			return res.json();
		},
		onMutate: async (status) => {
			await queryClient.cancelQueries({
				queryKey: ["issues", issueNumber],
			});

			const previousIssue = queryClient.getQueryData(["issues", issueNumber]);

			queryClient.setQueryData(["issues", issueNumber], (old) => ({ ...old, status }));

			return { previousIssue };
		},
		onError: (_err, _status, context) => {
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
				<span>status</span>
				<StatusSelect
					noEmptyOption
					value={status}
					onChange={(event) => setStatus.mutate(event.target.value)}
				/>
			</div>
		</div>
	);
}
