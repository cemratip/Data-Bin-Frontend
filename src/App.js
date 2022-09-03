import NewLink from "./NewLink";
import ExistingLink from "./ExistingLink";
import {Routes, Route} from "react-router-dom";

function App() {
    return (
        <div>
            <Routes>
                <Route path="" element={<NewLink/>} />
                <Route path=":endpoint" element={<ExistingLink/>} />
            </Routes>
        </div>
    );
}

export default App;