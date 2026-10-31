import "../General.css"
// Components
import ScheduleGridFE from "./Components/ScheduleMain";
import ScheduleNoticeFE from "./Components/ScheduleNotice"; 
import ScheduleHistoryFE from "./Components/ScheduleHistory";

export default function StudentChedule() {
    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-9">
                    <ScheduleGridFE/>
                </div>
                <div className="col-3">
                    <ScheduleHistoryFE/>
                </div>
                <div className="col-9">
                    <ScheduleNoticeFE/>
                </div>
            </div>
        </div>
    );
}
