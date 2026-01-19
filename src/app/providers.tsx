import { BrowserRouter } from "react-router";

export function AppContextProvider(props: React.PropsWithChildren) {
    return (
        <BrowserRouter>
            {props.children}
        </BrowserRouter>
    );
}