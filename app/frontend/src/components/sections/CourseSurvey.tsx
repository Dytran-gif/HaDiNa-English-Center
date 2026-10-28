import { useState } from "react";
import Button from "../ui/Button";
import { surveyQuestions, recommendCourse } from "./surveyConfig";
import "./CourseSurvey.css";

export default function CourseSurvey() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const total = surveyQuestions.length;
  const current = surveyQuestions[step];
  const isLast = step === total - 1;

  function choose(value: string) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (isLast) {
      setDone(true);
    } else {
      setStep((s) => s + 1);
    }
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setDone(false);
  }

  const result = done ? recommendCourse(answers) : null;

  return (
    <section className="survey">
      <div className="container survey__inner">
        <div className="survey__head">
          <span className="kicker">Tư vấn chọn khoá</span>
          <h2>Chưa biết bắt đầu từ đâu?</h2>
          <p>
            Trả lời 3 câu hỏi ngắn, chúng tôi sẽ gợi ý khoá học phù hợp nhất với
            bạn.
          </p>
        </div>

        <div className="survey__card">
          {!done && current && (
            <div key={current.id} className="survey__step">
              <div className="survey__progress">
                <div className="survey__dots">
                  {surveyQuestions.map((q, i) => (
                    <span
                      key={q.id}
                      className={
                        i <= step ? "survey__dot is-active" : "survey__dot"
                      }
                    />
                  ))}
                </div>
                <span className="survey__count">
                  Câu {step + 1}/{total}
                </span>
              </div>

              <h3 className="survey__question">{current.question}</h3>

              <div className="survey__options">
                {current.options.map((opt, i) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="survey__option"
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={() => choose(opt.value)}
                  >
                    <span>{opt.label}</span>
                    <span className="survey__arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>

              {step > 0 && (
                <button
                  type="button"
                  className="survey__back"
                  onClick={() => setStep((s) => s - 1)}
                >
                  ← Quay lại
                </button>
              )}
            </div>
          )}

          {done && result && (
            <div className="survey__result">
              <span className="kicker">Gợi ý cho bạn</span>
              <h3 className="survey__result-name">{result.courseName}</h3>
              <p className="survey__result-reason">{result.reason}</p>
              <div className="survey__result-actions">
                <Button to={`/khoa-hoc/${result.slug}`} variant="primary">
                  Xem khoá học →
                </Button>
                <button
                  type="button"
                  className="survey__back"
                  onClick={restart}
                >
                  Làm lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
