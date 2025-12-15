import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function AddIssue() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const addIssue = useMutation({
    mutationFn: (issueBody) => {
      return fetch("/api/issues", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(issueBody),
      }).then((res) => res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["issues"], exact: true });
      queryClient.setQueryData(["issues", data.number.toString()], data);
      navigate(`/issue/${data.number}`);
    },
  });
  return (
    <div className="add-issue">
      <h2>Add Issue</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (addIssue.isPending) return;
          addIssue.mutate({
            comment: event.target.comment.value,
            title: event.target.title.value,
          });
        }}
      >
        <label htmlFor="title">Title</label>
        <input type="text" id="title" placeholder="Title" name="title" />
        <label htmlFor="comment">Comment</label>
        <textarea placeholder="Comment" id="comment" name="comment" />
        <button type="submit" disabled={addIssue.isPending}>
          {addIssue.isPending ? "Adding Issue..." : "Add Issue"}
        </button>
      </form>
    </div>
  );
}
