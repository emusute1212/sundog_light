import { EventCreateRequest } from "@/features/event/types/event-create-request";
import { EventUpdateRequest } from "@/features/event/types/event-update-request";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EventDeleteConfirmDialog from "./EventDeleteConfirmDialog";
import { LoadingDialog } from "../../../core/LoadingDialog";
import toast from "react-hot-toast";

export default function EventEditSubmitButton({
    request,
    isValid,
}: {
    request: EventCreateRequest | EventUpdateRequest;
    isValid: boolean;
}) {
    const router = useRouter();
    const isEdit: boolean = request.type == "update-request";
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    const onClickSubmitButton = async () => {
        if (!isValid) return;
        setLoading(true);
        try {
            const response = await fetch(
                isEdit ? "/api/event/update" : "/api/event/create",
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(request),
                }
            );
            if (!response.ok) {
                toast.error(
                    `エラーが発生しました！\nエラーコード：${response.status}\n${response.statusText}`
                );
            } else {
                router.push(`/event/list`);
            }
        } catch (error) {
            console.error("イベント一覧の取得に失敗しました:", error);
            toast.error(`エラーが発生しました！`);
        } finally {
            setLoading(false);
        }
    };
    const onClickDeleteButton = async () => {
        if (isEdit) {
            setLoading(true);
            try {
                const response = await fetch(
                    `/api/event/remove/${
                        (request as EventUpdateRequest).eventDetail.uuid
                    }`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) {
                    toast.error(
                        `エラーが発生しました！\nエラーコード：${response.status}\n${response.statusText}`
                    );
                } else {
                    router.push(`/event/list`);
                }
            } catch (error) {
                console.error("イベント一覧の取得に失敗しました:", error);
                toast.error(`エラーが発生しました！`);
            } finally {
                setLoading(false);
            }
        }
    };
    return (
        <div className={`flex flex-col items-center w-full p-4 gap-2 mt-8`}>
            <button
                className={`inline-flex px-6 py-2 rounded-lg border transition-colors ${
                    isValid
                        ? "bg-black text-white border-black hover:bg-gray-700"
                        : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                }`}
                onClick={onClickSubmitButton}
                disabled={!isValid}
            >
                イベントを保存する
            </button>
            {isEdit && (
                <>
                    <button
                        className={`inline-flex bg-white text-black px-6 py-2 rounded-lg border border-black hover:bg-gray-100 transition-colors`}
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        イベントを削除する
                    </button>
                    {showDeleteDialog && (
                        <EventDeleteConfirmDialog
                            onClickDeleteButton={onClickDeleteButton}
                            onCloseDialog={() => setShowDeleteDialog(false)}
                        />
                    )}
                </>
            )}
            {loading && <LoadingDialog />}
        </div>
    );
}
