import { useQuery } from "@tanstack/react-query";

export function useUserData(userId) {
	const usersQuery = useQuery({
		queryKey: ["users", userId],
		queryFn: ({ signal }) => {
			return fetch(`/api/users/${userId}`, { signal }).then((res) => res.json());
		},
		staleTime: 1000 * 60 * 60,
	});

	return usersQuery;
}
