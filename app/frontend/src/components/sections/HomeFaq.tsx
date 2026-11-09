import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import "./HomeFaq.css";

const questions = [
  { title: "Chưa biết trình độ của mình thì chọn khóa nào?", text: "Bạn có thể bắt đầu bằng phần gợi ý khóa học trên trang chủ. Kết quả là định hướng tham khảo; hãy trao đổi thêm với trung tâm trước khi quyết định đăng ký." },
  { title: "Tôi có thể xem nội dung và học phí ở đâu?", text: "Mở mục Khóa học, chọn chương trình bạn quan tâm để xem nội dung, đối tượng và học phí tham khảo. Lịch khai giảng và mức phí thực tế cần được xác nhận với trung tâm." },
  { title: "Có chương trình cho học sinh và người mới bắt đầu không?", text: "Danh mục khóa học có chương trình nền tảng và tiếng Anh dành cho thiếu nhi, thiếu niên. Bạn có thể lọc theo nhóm chương trình để tìm hiểu lựa chọn phù hợp." },
];

export default function HomeFaq() {
  return <section className="home-faq container">
    <div className="home-faq__intro"><SectionHeading kicker="Trước khi bắt đầu" title="Bạn hỏi, chúng tôi giải đáp"/><p>Một vài thông tin giúp bạn chọn chương trình dễ dàng hơn.</p><Button to="/lien-he" variant="outline">Tôi cần tư vấn thêm →</Button></div>
    <div className="home-faq__questions">{questions.map(question => <details key={question.title}><summary>{question.title}</summary><p>{question.text}</p></details>)}</div>
  </section>;
}
