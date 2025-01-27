import {
  Link,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const params = useParams();
  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     await queryClient.cancelQueries({ queryKey: ["events", params.id] });
  //     const previousEvent = queryClient.getQueryData(["events", params.id]);
  //     queryClient.setQueryData(["events", params.id], newEvent);
  //     return { previousEvent };
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(["events", params.id], context.previousEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ["events", params.id] });
  //   }, // no matter fail or success
  // });

  function handleSubmit(formData) {
    // mutate({
    //   id: params.id,
    //   event: formData,
    // });
    // navigate("../");
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            "Failed to load event, please try again later."
          }
        />
        <div className="form-actions">
          <Link to="../" className="button-text">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Updating event...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

//fetch data before component render
export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  queryClient.invalidateQueries({ queryKey: ["events", params.id] });
  return redirect("../");
}
