import { useState } from "react";
import "../General.css";
import PaymentFE from "./Components/Payment";
import PaymentHistory from "./Components/PaymentHistory";

export default function StudentTuition() {
    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-12"> 
                    <PaymentFE />
                </div>
                <div className="col-12">
                    <PaymentHistory />
                </div>
            </div>
        </div>
    );
}