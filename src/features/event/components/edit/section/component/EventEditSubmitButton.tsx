import { EventCreateRequest } from "@/features/event/types/event-create-request";
import { EventUpdateRequest } from "@/features/event/types/event-update-request";
import { useRouter } from "next/navigation";

export default function EventEditSubmitButton({
  request,
}: {
  request: EventCreateRequest | EventUpdateRequest;
}) {
  const router = useRouter();
  const isEdit: boolean = request.type == "update-request";
  const onClickSubmitButton = async () => {
    await fetch(isEdit ? "/api/event/update" : "/api/event/create", {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    router.push(`/event/list`);
  };
  const onClickDeleteButton = async () => {
    if (isEdit) {
      await fetch(
        `/api/event/remove/${(request as EventUpdateRequest).eventDetail.uuid}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      router.push(`/event/list`);
    }
  };
  return (
    <div className={`flex flex-col items-center w-full p-4 gap-2 mt-8`}>
      <button
        className={`inline-flex bg-black text-white px-6 py-2 rounded-lg border border-black hover:bg-gray-700 transition-colors`}
        onClick={onClickSubmitButton}
      >
        イベントを保存する
      </button>
      {isEdit && (
        <button
          className={`inline-flex bg-white text-black px-6 py-2 rounded-lg border border-black hover:bg-gray-100 transition-colors`}
          onClick={onClickDeleteButton}
        >
          イベントを削除する
        </button>
      )}
    </div>
  );
}
