import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useUserData } from "../helpers/useUserData";
import { IssueHeader } from "./IssueHeader";
import { relativeDate } from "../helpers/relativeDate";
import IssueStatus from "./IssueStatus";
import IssueAssignment from "./IssueAssignment";
import IssueLabels from "./IssueLabels";
import useScrollToBottomAction from "../helpers/useScrollToBottomAction";
import Loader from "./Loader";

function useIssueData(issueNumber) {
  return useQuery({
    queryKey: ["issues", issueNumber],
    queryFn: ({ signal }) =>
      fetch(`/api/issues/${issueNumber}`, { signal }).then((res) => res.json()),
  });
}

function useIssueComments(issueNumber) {
  return useInfiniteQuery({
    queryKey: ["issues", issueNumber, "comments"],
    queryFn: ({ signal, pageParam = 1 }) =>
      fetch(`/api/issues/${issueNumber}/comments?page=${pageParam}`, { signal }).then((res) =>
        res.json(),
      ),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0) return undefined;
      return pages.length + 1;
    },
  });
}

function Comment({ comment, createdBy, createdDate }) {
  const userQuery = useUserData(createdBy);

  if (userQuery.isPending)
    return (
      <div className="comment">
        <div>
          <div className="comment-header">Loading...</div>
        </div>
      </div>
    );

  return (
    <div className="comment">
      <img src={userQuery.data.profilePictureUrl} alt="Commenter Avatar" />
      <div>
        <div className="comment-header">
          <span>{userQuery.data.name}</span> commented <span>{relativeDate(createdDate)}</span>
        </div>
        <div className="comment-body">{comment}</div>
      </div>
    </div>
  );
}

export default function IssueDetails() {
  const { number } = useParams();
  const issueQuery = useIssueData(number);
  const commentsQuery = useIssueComments(number);

  useScrollToBottomAction(document, commentsQuery.fetchNextPage, 100);

  return (
    <div className="issue-details">
      {issueQuery.isPending ? (
        <p>Loading issue...</p>
      ) : (
        <>
          <IssueHeader {...issueQuery.data} />
          <main>
            <section>
              {commentsQuery.isPending ? (
                <p>Loading...</p>
              ) : (
                commentsQuery.data?.pages.map((commentPage) =>
                  commentPage.map((comment) => <Comment key={comment.id} {...comment} />),
                )
              )}
              {commentsQuery.isFetchingNextPage && <Loader />}
            </section>
            <aside>
              <IssueStatus
                status={issueQuery.data.status}
                issueNumber={issueQuery.data.number.toString()}
              />
              <IssueAssignment
                assignee={issueQuery.data.assignee}
                issueNumber={issueQuery.data.number.toString()}
              />
              <IssueLabels
                labels={issueQuery.data.labels}
                issueNumber={issueQuery.data.number.toString()}
              />
            </aside>
          </main>
        </>
      )}
    </div>
  );
}
