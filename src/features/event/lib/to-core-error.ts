import { ApiError, getDisplayErrorMessage } from "@/lib/api-client";
import { CoreError } from "../types/core-error";

export function toCoreError(error: unknown): CoreError {
    if (error instanceof ApiError) {
        return {
            errorCode: error.status,
            errorMessage: error.message,
        };
    }

    return {
        errorCode: 500,
        errorMessage: getDisplayErrorMessage(error),
    };
}
