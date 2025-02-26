import {EventCreateRequest} from "@/features/event/types/event-create-request";
import {EventUpdateRequest} from "@/features/event/types/event-update-request";
import {useRouter} from "next/navigation";

export default function EventEditSubmitButton(props: {
    request: EventCreateRequest | EventUpdateRequest,
}) {
    const router = useRouter();
    const isEdit: boolean = (props.request.type == "update-request");
    const onClickSubmitButton = async () => {
        const path = isEdit ? "/api/event/update" : "/api/event/create"
        await fetch(path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(props.request),
        });
        // router.push(`/event/detail/${JSON.parse(await response.json()).uuid}`);
        router.push(`/event/list`);
    };
    const onClickDeleteButton = async () => {
        if (isEdit) {
            await fetch(`/api/event/remove/${(props.request as EventUpdateRequest).eventDetail.uuid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({key: props.request.userId}),
            });
            router.push(`/event/list`);
        }
    }
    return (
        <div className={`flex flex-col`}>
            <button
                className={`mt-2 bg-black text-white px-4 py-2 rounded-lg`}
                onClick={onClickSubmitButton}
            >イベントを保存する
            </button>
            {isEdit && (
                <button
                    className={`mt-2 bg-white text-black px-4 py-2 rounded-lg border border-black`}
                    onClick={onClickDeleteButton}
                >イベントを削除する
                </button>
            )}
        </div>
    )
}