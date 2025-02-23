import EventColorSelectComponent from "@/features/event/components/detail/event-color-select-component";

export default function EventColorListComponent(props: {
    colors: string[],
    onClickColor: (color: string) => void,
}) {
    return (
        <div className={`grid grid-cols-4 gap-4`}>
            {props.colors.map((color: string, i: number) => {
                    return (
                        <EventColorSelectComponent
                            key={i}
                            color={color}
                            onClickColor={props.onClickColor}
                        />
                    )
                }
            )}
        </div>
    );
}
