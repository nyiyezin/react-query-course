import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IssueItem } from "./IssueItem";
import { useState } from "react";
import fetchWithError from "../helpers/fetchWithError";
import Loader from "./Loader";

export default function IssuesList({ labels, status, pageNum, setPageNum }) {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");

  const issuesQuery = useQuery({
    queryKey: ["issues", { labels, status, pageNum }],
    queryFn: async ({ signal }) => {
      const statusString = status ? `&status=${status}` : "";
      const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
      const paginationString = pageNum ? `&page=${pageNum}` : "";

      const results = await fetchWithError(
        `/api/issues?${labelsString}${statusString}${paginationString}`,
        { signal },
      );

      results.forEach((issue) => {
        queryClient.setQueryData(["issues", issue.number.toString()], issue);
      });

      return results;
    },
    keepPreviousData: true,
  });

  const searchQuery = useQuery({
    queryKey: ["issues", "search", searchValue],
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/search/issues?q=${searchValue}`, { signal });
      return res.json();
    },
    enabled: searchValue.length > 0,
  });

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSearchValue(event.target.elements.search.value);
        }}
      >
        <label htmlFor="search">Search Issues</label>
        <input
          type="search"
          placeholder="search"
          name="search"
          id="search"
          onChange={(event) => {
            if (event.target.value.length === 0) setSearchValue("");
          }}
        />
      </form>

      <h2>Issues List {issuesQuery.fetchStatus === "fetching" ? <Loader /> : null}</h2>

      {issuesQuery.isPending ? (
        <p>Loading...</p>
      ) : searchQuery.fetchStatus === "idle" && searchQuery.isPending ? (
        <>
          <ul className="issues-list">
            {issuesQuery.data.map((issue) => (
              <IssueItem
                key={issue.id}
                title={issue.title}
                number={issue.number}
                assignee={issue.assignee}
                commentCount={issue.comments.length}
                createdBy={issue.createdBy}
                createdDate={issue.createdDate}
                labels={issue.labels}
                status={issue.status}
              />
            ))}
          </ul>

          <div className="pagination">
            <button
              onClick={() => pageNum - 1 > 0 && setPageNum(pageNum - 1)}
              disabled={pageNum === 1}
            >
              Previous
            </button>

            <p>
              Page {pageNum} {issuesQuery.isFetching ? "..." : ""}
            </p>

            <button
              disabled={issuesQuery.data?.length === 0 || issuesQuery.isPreviousData}
              onClick={() =>
                issuesQuery.data?.length !== 0 &&
                !issuesQuery.isPreviousData &&
                setPageNum(pageNum + 1)
              }
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Search Results</h2>
          {searchQuery.isPending ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>{searchQuery.data.count} Results</p>
              <ul className="issues-list">
                {searchQuery.data.items.map((issue) => (
                  <IssueItem
                    key={issue.id}
                    title={issue.title}
                    number={issue.number}
                    assignee={issue.assignee}
                    commentCount={issue.comments.length}
                    createdBy={issue.createdBy}
                    createdDate={issue.createdDate}
                    labels={issue.labels}
                    status={issue.status}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
