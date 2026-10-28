import "./CertificateMock.css";

interface CertificateMockProps {
  label: string;
  accent: string;
}

export default function CertificateMock({ label, accent }: CertificateMockProps) {
  return (
    <div className="cert-mock" aria-hidden="true">
      <div className="cert-mock__card cert-mock__card--back">
        <div className="cert-mock__header" style={{ color: accent }}>
          {label}
        </div>
        <div className="cert-mock__row">
          <span className="cert-mock__photo" />
          <div className="cert-mock__lines">
            <span style={{ width: "70%" }} />
            <span style={{ width: "50%" }} />
            <span style={{ width: "60%" }} />
          </div>
        </div>
      </div>
      <div className="cert-mock__card cert-mock__card--front">
        <div className="cert-mock__header" style={{ color: accent }}>
          {label}
        </div>
        <div className="cert-mock__badge" style={{ background: accent }} />
        <div className="cert-mock__row">
          <span className="cert-mock__photo" />
          <div className="cert-mock__lines">
            <span style={{ width: "80%" }} />
            <span style={{ width: "55%" }} />
            <span style={{ width: "65%" }} />
            <span style={{ width: "40%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
