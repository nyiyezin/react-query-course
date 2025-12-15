import { useUserData } from "../helpers/useUserData";
import { GoGear } from "react-icons/go";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function IssueAssignment({ assignee, issueNumber }) {
	const queryClient = useQueryClient();
	const user = useUserData(assignee);
	const [menuOpen, setMenuOpen] = useState(false);

	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			const res = await fetch("/api/users");
			return await res.json();
		},
	});

	const setAssignment = useMutation({
		mutationFn: async (assignee) => {
			const res = await fetch(`/api/issues/${issueNumber}`, {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ assignee }),
			});

			return await res.json();
		},
		onMutate: async (assignee) => {
			await queryClient.cancelQueries({
				queryKey: ["issues", issueNumber],
			});

			const previousIssue = queryClient.getQueryData(["issues", issueNumber]);

			queryClient.setQueryData(["issues", issueNumber], (old) => ({ ...old, assignee }));

			return { previousIssue };
		},
		onError: (_err, _assignee, context) => {
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
				<span>Assignment</span>
				{user.isSuccess && (
					<div>
						<img src={user.data.profilePictureUrl} />
						{user.data.name}
					</div>
				)}
			</div>
			<GoGear onClick={() => !usersQuery.isPending && setMenuOpen((open) => !open)} />
			{menuOpen && (
				<div className="picker-menu">
					{usersQuery.data?.map((user) => (
						<div key={user.id} onClick={() => setAssignment.mutate(user.id)}>
							<img src={user.profilePictureUrl} />
							{user.name}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
