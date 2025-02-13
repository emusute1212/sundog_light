"use client";
import {ChangeEvent} from "react";

export default function EventDetailPage() {
    const handleSelectColor = async (e: ChangeEvent<HTMLInputElement>) => {
        const body = { selectedColor: e.target.value };
        const data = await fetch("/api/color", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const json = await data.json();
        console.log("handle_test_click_response", json);
    };
    return (
        <input type="color" onChange={
            e => handleSelectColor(e)
        } />
    );
}
