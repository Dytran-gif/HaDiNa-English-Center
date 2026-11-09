import re, json
from essays import PROMPTS, ESSAYS, ANNOTATIONS, SPEAKING_AUDIO

import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "teacher-demo-data.sql")
WORD = re.compile(r"[^\W_]+(?:['’\-][^\W_]+)*")
def words(t): return len(WORD.findall(t or ""))

def q(s):
    if s is None: return "NULL"
    return "N'" + str(s).replace("'", "''") + "'"
def num(x): return "NULL" if x is None else (str(x))
def D(d): return f"DATEADD(day,{d},@today)"
def AT(d, hm="00:00"):
    h, m = map(int, hm.split(":")); return f"DATEADD(minute,{h*60+m},CAST(DATEADD(day,{d},@today) AS datetime2(0)))"
def DUE(d): return AT(d, "23:59")
def overall(sc):
    avg = sum(sc) / len(sc); import math; return math.floor(avg * 2 + 0.5) / 2
def clamp(b): return max(3.0, min(8.5, b))

L = []
def w(s=""): L.append(s)

# ---------------------------------------------------------------- dữ liệu
STU = [  # No, Code, FullName, email, phone, dob, level, target, parent, parentPhone, address
 (1,"HV2001","Lê Minh Anh","minhanh.le@demo.com","0903112201","2005-03-14",6.0,7.0,"Lê Văn Hùng","0913112201","Quận 3, TP.HCM"),
 (2,"HV2002","Phạm Quốc Bảo","quocbao.pham@demo.com","0903112202","2006-07-22",5.5,6.5,"Phạm Thị Lan","0913112202","Quận Bình Thạnh, TP.HCM"),
 (3,"HV2003","Nguyễn Hoàng Yến","hoangyen.nguyen@demo.com","0903112203","2004-11-02",6.5,7.5,"Nguyễn Văn Tâm","0913112203","TP. Thủ Đức, TP.HCM"),
 (4,"HV2004","Trần Đức Huy","duchuy.tran@demo.com","0903112204","2005-01-30",6.0,7.0,"Trần Văn Bình","0913112204","Quận 7, TP.HCM"),
 (5,"HV2005","Võ Thảo Vy","thaovy.vo@demo.com","0903112205","2004-09-18",6.5,7.0,"Võ Minh Quang","0913112205","Quận Phú Nhuận, TP.HCM"),
 (6,"HV2006","Đặng Gia Hân","giahan.dang@demo.com","0903112206","2007-04-05",5.5,6.5,"Đặng Thu Hà","0913112206","Quận 10, TP.HCM"),
 (7,"HV2007","Bùi Thanh Tùng","thanhtung.bui@demo.com","0903112207","2006-12-11",5.0,6.5,"Bùi Văn Sơn","0913112207","Quận Gò Vấp, TP.HCM"),
 (8,"HV2008","Huỳnh Ngọc Trâm","ngoctram.huynh@demo.com","0903112208","2006-02-27",5.5,6.5,"Huỳnh Văn Lộc","0913112208","Quận Tân Bình, TP.HCM"),
 (9,"HV2009","Phan Nhật Nam","nhatnam.phan@demo.com","0903112209","2005-08-08",5.0,6.0,"Phan Thị Hồng","0913112209","Dĩ An, Bình Dương"),
 (10,"HV2010","Lý Khánh Linh","khanhlinh.ly@demo.com","0903112210","2005-05-19",5.5,6.5,"Lý Văn Phát","0913112210","Quận 5, TP.HCM"),
 (11,"HV2011","Đỗ Minh Khoa","minhkhoa.do@demo.com","0903112211","2006-10-01",5.5,6.0,"Đỗ Thị Mai","0913112211","Quận 11, TP.HCM"),
 (12,"HV2012","Ngô Bảo Ngọc","baongoc.ngo@demo.com","0903112212","2007-06-25",4.5,5.5,"Ngô Văn Thành","0913112212","Quận 8, TP.HCM"),
 (13,"HV2013","Hồ Tuấn Kiệt","tuankiet.ho@demo.com","0903112213","2004-04-16",6.0,7.0,"Hồ Văn Dũng","0913112213","Quận 1, TP.HCM"),
 (14,"HV2014","Trương Mỹ Duyên","myduyen.truong@demo.com","0903112214","2006-01-09",5.0,6.0,"Trương Thị Nga","0913112214","Thủ Dầu Một, Bình Dương"),
 (15,"HV2015","Lâm Gia Bảo","giabao.lam@demo.com","0903112215","2007-09-03",4.5,5.5,"Lâm Văn Khải","0913112215","Quận 6, TP.HCM"),
 (16,"HV2016","Châu Anh Thư","anhthu.chau@demo.com","0903112216","2006-03-21",5.0,6.0,"Châu Văn Long","0913112216","Quận 12, TP.HCM"),
]
LVL = {s[0]: s[6] for s in STU}
NAME = {s[0]: s[2] for s in STU}

ROSTER = {
 "C1": [1,2,3,4,5,6,7,8],
 "C2": [6,8,9,10,11,12,13,14,15,16],
 "C3": [1,3,4,5,9,10,11,13],
 "C4": [2,7,12,14,15,16],
 "C5": [1,3,5,9,10,13],
}
CLASSES = [  # key, courseKey, name, startOffset, endOffsetFromStart, max, roomName, meetingUrl, schedules[(day,start,end)]
 ("C2","FOUND","IELTS Foundation 5.5 - Lớp tối 3-5-7",-33,63,15,"P201",None,[(2,"18:00","19:30"),(4,"18:00","19:30"),(6,"09:00","11:00")]),
 ("C3","WRIT","IELTS Writing 7.0 - Lớp cuối tuần",-24,58,12,"P202","https://meet.google.com/hdn-wrt-700",[(6,"14:00","16:30"),(7,"09:00","11:30")]),
 ("C4","C65","IELTS 6.5 - Lớp sáng 3-5",9,90,18,"P102",None,[(2,"08:00","10:00"),(4,"08:00","10:00")]),
 ("C5","SPEAK","IELTS Speaking 6.0 - Khóa tháng 8",-84,45,10,"P102",None,[(1,"19:30","21:00"),(3,"19:30","21:00")]),
]
COURSES = [  # key, name, description, bandFrom, bandTo, total, perWeek, tuition, discount
 ("FOUND","IELTS Foundation 5.5","Xây nền tảng 4 kỹ năng cho học viên mất gốc đến trung bình, mục tiêu 5.5.",4.0,5.5,24,3,4500000,5),
 ("WRIT","IELTS Writing Intensive 7.0","Luyện chuyên sâu Writing Task 1 & Task 2, chữa bài 1-1 mỗi tuần.",6.0,7.0,16,2,3800000,0),
 ("SPEAK","IELTS Speaking Booster 6.0","Phản xạ nói theo chủ đề Part 1-3, luyện phát âm và ngữ điệu.",5.0,6.0,12,2,2500000,10),
]
ROOMS = [("P102",18),("P201",16),("P202",12)]

SYL = {  # course -> [(title, description, contentTaught, homework)]
 "FOUND": [
  ("Giới thiệu IELTS & kiểm tra đầu vào","Cấu trúc 4 kỹ năng, thang band, mục tiêu khóa học.","Giới thiệu format bài thi, làm bài test đầu vào 60 phút, nhận xét chung.","Đọc tài liệu giới thiệu IELTS, ghi lại 3 mục tiêu cá nhân."),
  ("Writing Task 1: Line graph","Cấu trúc 4 đoạn, cách viết overview.","Phân tích đề line graph, luyện viết câu overview và nhóm số liệu.","Viết bài Task 1 Internet access (150 từ)."),
  ("Reading: Skimming & Scanning","Kỹ thuật đọc lướt, tìm thông tin chi tiết.","Luyện skimming tiêu đề đoạn, scanning tên riêng/số liệu với Passage 1.","Làm Reading Passage 1 - History of Tea."),
  ("Listening Section 1: Form completion","Nghe điền form, chú ý chính tả và số.","Luyện nghe đánh vần tên, số điện thoại, ngày tháng.","Nghe lại Section 1 - Hotel booking 2 lần, chép chính tả."),
  ("Speaking Part 1: Hometown, Work, Study","Trả lời 2-3 câu, mở rộng bằng lý do và ví dụ.","Luyện cặp đôi Part 1, sửa lỗi phát âm âm cuối.","Thu âm 4 câu Part 1 chủ đề Hometown."),
  ("Grammar: Thì hiện tại & quá khứ","Ôn thì cơ bản dùng trong Writing/Speaking.","Ôn hiện tại đơn, quá khứ đơn, động từ bất quy tắc thường gặp.","Làm 40 câu bài tập chia động từ."),
  ("Writing Task 2: Opinion essay","Dàn ý 4 đoạn, cách nêu quan điểm.","Phân tích đề, lập dàn ý, viết mở bài và 1 đoạn thân bài.","Viết hoàn chỉnh Task 2 Free university (250 từ)."),
  ("Reading: True / False / Not Given","Phân biệt False và Not Given.","Luyện 3 bài TFNG, phân tích bẫy thường gặp.","Làm 2 bài TFNG trong sách Cambridge 15."),
  ("Speaking Part 2: Describe a place","Lập dàn ý 1 phút, nói 2 phút.","Hướng dẫn note-taking 1 phút, luyện nói theo cặp.","Thu âm Part 2 Describe a place you like to visit."),
  ("Listening Section 2: Map labelling","Từ vựng chỉ đường, vị trí.","Luyện nghe bản đồ, từ vựng opposite, next to, behind.","Làm 2 bài Map labelling."),
  ("Vocabulary: Education & Technology","Collocation chủ đề giáo dục và công nghệ.","Học 30 collocation, luyện viết câu.","Học thuộc bảng từ vựng Education."),
  ("Review & Mock test giữa kỳ","Ôn tập và làm đề thi thử.","Ôn tập trọng tâm, làm mock test Listening & Reading.","Xem lại các lỗi sai trong mock test."),
 ],
 "WRIT": [
  ("Task 1 overview & data grouping","Cách nhóm số liệu, viết overview band 7.","Chữa overview của 8 học viên, phân tích bài mẫu band 7.","Viết lại overview cho 3 biểu đồ."),
  ("Task 2 Discussion essay","Cấu trúc discuss both views + opinion.","Phân tích đề Technology & learning, luyện topic sentence.","Viết Task 2 Technology (270 từ)."),
  ("Cohesion & paragraphing","Từ nối, đại từ thay thế, câu chủ đề.","Sửa bài theo tiêu chí CC, luyện referencing.","Viết lại 1 đoạn thân bài với 4 từ nối mới."),
  ("Task 1 Bar chart & Table","So sánh số liệu, cấu trúc so sánh hơn/nhất.","Phân tích bar chart Leisure activities, luyện câu so sánh.","Viết Task 1 Leisure activities (150 từ)."),
  ("Lexical resource cho band 7","Paraphrase, collocation học thuật, tránh lặp từ.","Luyện paraphrase đề, thay thế từ phổ thông bằng từ học thuật.","Học 20 collocation chủ đề Environment/Transport."),
  ("Task 2 Problem - Solution","Nêu nguyên nhân, giải pháp, ví dụ cụ thể.","Brainstorm đề Traffic congestion, lập dàn ý.","Viết Task 2 Traffic congestion."),
  ("Grammatical range: câu phức","Mệnh đề quan hệ, câu điều kiện, bị động.","Luyện biến đổi câu đơn thành câu phức không sai ngữ pháp.","Sửa 15 câu sai ngữ pháp trong bài cũ."),
  ("Timed writing & chữa bài 1-1","Viết 60 phút, chữa bài trực tiếp.","Làm full test Writing 60 phút, chữa bài cá nhân.","Viết lại bài theo nhận xét."),
 ],
 "SPEAK": [
  ("Part 1: trả lời mở rộng","Công thức Answer - Reason - Example.","Luyện 20 câu Part 1 theo cặp.","Thu âm 5 câu Part 1."),
  ("Phát âm: âm cuối & trọng âm","Âm -s, -ed, trọng âm từ nhiều âm tiết.","Luyện minimal pairs, đọc đoạn văn có âm cuối.","Đọc và thu âm đoạn văn mẫu."),
  ("Part 2: kể chuyện quá khứ","Thì quá khứ, từ nối trình tự.","Luyện Describe a trip, sửa lỗi thì quá khứ.","Chuẩn bị 3 đề Part 2 về trải nghiệm."),
  ("Part 2: mô tả người & địa điểm","Tính từ mô tả, cấu trúc so sánh.","Luyện Describe a person/place có ghi âm.","Thu âm Describe a person you admire."),
  ("Part 3: trả lời câu hỏi trừu tượng","Đưa quan điểm, so sánh quá khứ - hiện tại.","Thảo luận nhóm các chủ đề xã hội.","Chuẩn bị ý cho 10 câu Part 3."),
  ("Mock test Speaking","Thi thử full 3 phần, nhận xét band.","Thi thử 1-1 với giáo viên, nhận xét chi tiết.","Xem lại nhận xét và luyện lại phần yếu."),
 ],
 "C65": [
  ("Giới thiệu bài thi IELTS & kiểm tra đầu vào","Format bài thi, test đầu vào.","Giới thiệu khóa học, làm test đầu vào.","Ôn lại từ vựng cơ bản."),
  ("Writing Task 1: Line graph","Cấu trúc và overview.","Phân tích line graph, viết overview.","Viết 1 bài Task 1."),
  ("Speaking Part 1: Hometown, Work, Study","Trả lời mở rộng.","Luyện Part 1 theo cặp.","Thu âm Part 1."),
  ("Reading: Skimming & Scanning","Đọc lướt, đọc quét.","Luyện kỹ thuật đọc nhanh.","Làm 1 bài Reading."),
  ("Listening Section 1-2: Form completion","Nghe điền form.","Luyện nghe số và tên riêng.","Nghe lại bài trên lớp."),
  ("Writing Task 2: Opinion essay","Dàn ý opinion essay.","Lập dàn ý và viết mở bài.","Viết 1 bài Task 2."),
  ("Speaking Part 2: Describe a person","Note-taking 1 phút.","Luyện nói 2 phút.","Thu âm Part 2."),
  ("Reading: True/False/Not Given","Dạng TFNG.","Luyện TFNG.","Làm 2 bài TFNG."),
  ("Writing Task 1: Bar chart & Table","So sánh số liệu.","Phân tích bar chart.","Viết 1 bài Task 1."),
  ("Listening Section 3-4: Multiple choice","Nghe hội thoại học thuật.","Luyện multiple choice.","Làm 1 bài Section 3."),
  ("Writing Task 2: Discussion essay","Discuss both views.","Lập dàn ý discussion.","Viết 1 bài Task 2."),
  ("Speaking Part 3: Abstract topics","Trả lời câu hỏi trừu tượng.","Thảo luận nhóm.","Chuẩn bị ý Part 3."),
 ],
}

ASG = [  # key, class, title, skill, type, dueOffset, createdOffset, minWords, attachment, note, allowLate, assignToAll, targets
 ("A1","C2","Writing Task 1 - Internet access (line graph)","Writing","Writing",-20,-27,150,"/uploads/demo/task1-line-graph.png","Nhớ viết overview, không nêu ý kiến cá nhân.",True,True,None),
 ("A2","C2","Writing Task 2 - Should university education be free?","Writing","Writing",-6,-13,250,None,"Dàn ý 4 đoạn như đã học. Bài dưới 250 từ sẽ bị trừ điểm TR.",True,True,None),
 ("A3","C2","Reading Quiz - The History of Tea","Reading","Quiz",-10,-14,None,"/uploads/demo/reading-passage-1.pdf","Đọc passage trong file PDF rồi trả lời 5 câu.",False,True,None),
 ("A4","C2","Speaking Part 2 - Describe a place you like to visit","Speaking","Speaking",-3,-9,None,None,"Thu âm bằng điện thoại, không cắt ghép.",True,True,None),
 ("A5","C2","Listening Quiz - Section 1: Hotel booking","Listening","Quiz",3,-2,None,"/uploads/demo/listening-section1-hotel.mp3","Nghe 1 lần duy nhất như thi thật.",False,True,None),
 ("A6","C2","Writing Task 2 - Working from home","Writing","Writing",6,-1,250,None,None,True,True,None),
 ("A7","C3","Writing Task 2 - Technology and learning (discussion)","Writing","Writing",-12,-19,250,None,"Viết trong 40 phút, không dùng công cụ dịch.",True,True,None),
 ("A8","C3","Writing Task 1 - Leisure activities (bar chart)","Writing","Writing",-4,-10,150,"/uploads/demo/task1-bar-chart.png",None,True,True,None),
 ("A9","C3","Writing Task 2 - Traffic congestion (problem & solution)","Writing","Writing",2,-3,250,None,"Mỗi nguyên nhân đi kèm 1 giải pháp.",True,True,None),
 ("A10","C1","Reading Quiz - Vocabulary: Education","Reading","Quiz",-1,-5,None,"/uploads/demo/vocab-education.pdf","Ôn bảng từ vựng trong file đính kèm trước khi làm.",False,True,None),
 ("A11","C1","Speaking Part 1 - Hometown & Studies (nhóm luyện thêm)","Speaking","Speaking",4,0,None,None,"Bài luyện thêm cho các bạn cần cải thiện phát âm.",True,False,[6,7,8]),
 ("A12","C5","Speaking Final - Describe a memorable trip","Speaking","Speaking",-46,-50,None,None,"Bài thi cuối khóa, tính 40% điểm tổng kết.",False,True,None),
]
PROMPTS.setdefault("A3", "Đọc bài 'The History of Tea' (file PDF đính kèm) và trả lời 5 câu hỏi.")
PROMPTS.setdefault("A5", "Nghe đoạn hội thoại đặt phòng khách sạn (file audio đính kèm) và điền thông tin. Mỗi chỗ trống không quá 2 từ và/hoặc 1 số.")
PROMPTS.setdefault("A10", "Chọn đáp án đúng hoặc điền từ thích hợp. Ôn bảng từ vựng chủ đề Education trước khi làm.")

QUESTIONS = {
 "A3": [("MultipleChoice","According to the passage, tea was first valued mainly as...",["A. a daily drink","B. a medicine","C. a religious offering","D. a trade product"],"B","A"),
        ("MultipleChoice","Who wrote the first book entirely about tea?",["A. Shen Nong","B. a Japanese monk","C. Lu Yu","D. a Dutch trader"],"C","A"),
        ("FillBlank","Tea reached Europe through ______ traders.",None,"Dutch","British"),
        ("MultipleChoice","In the early seventeenth century, tea in Europe was...",["A. cheap","B. kept in locked boxes","C. banned","D. grown locally"],"B","A"),
        ("FillBlank","The British established tea plantations in India and ______.",None,"Sri Lanka|Srilanka|Ceylon","China")],
 "A5": [("FillBlank","Type of room: ______ room",None,"double","single"),
        ("FillBlank","Number of nights: ______",None,"3|three","5"),
        ("FillBlank","Surname of the guest: ______",None,"Nguyen","Nguyem"),
        ("FillBlank","Price per night (pounds): ______",None,"85|eighty-five|eighty five","95"),
        ("FillBlank","Booking reference: ______",None,"RH4729","RH4279")],
 "A10": [("MultipleChoice","'Rote learning' means...",["A. learning by heart without understanding","B. learning online","C. learning a practical skill","D. learning throughout life"],"A","D"),
         ("MultipleChoice","Rising ______ put pressure on families.",["A. tuition fees","B. peer pressure","C. curriculum","D. scholarships"],"A","D"),
         ("FillBlank","Activities outside the normal curriculum are called ______ activities.",None,"extracurricular|extra-curricular","outside"),
         ("MultipleChoice","'Drop out of school' is closest in meaning to...",["A. graduate","B. leave school early","C. change schools","D. fail an exam"],"B","A"),
         ("FillBlank","Education that every child must receive by law is ______ education.",None,"compulsory|mandatory","free")],
}

def var(level, opts):
    if level <= 5.0: v = "low"
    elif level <= 6.0: v = "mid"
    else: v = "high"
    if v not in opts: v = "mid" if "mid" in opts else opts[0]
    return v

FB = {
 "Writing": {"low": "Bài làm đủ ý cơ bản nhưng còn nhiều lỗi chia động từ (số ít/số nhiều, thì quá khứ). Câu còn đơn giản, hãy luyện thêm câu phức và từ nối. Xem các lỗi cô đã đánh dấu và sửa lại vào vở.",
             "mid": "Bố cục rõ ràng, có overview/quan điểm cụ thể. Cần mở rộng ý bằng ví dụ cụ thể hơn và đa dạng từ nối thay vì Firstly/Secondly. Chú ý vài lỗi mạo từ.",
             "high": "Bài viết rất tốt: lập luận chặt chẽ, từ vựng học thuật phong phú, ít lỗi ngữ pháp. Có thể rút gọn một vài câu dài để tăng độ mạch lạc. Giữ phong độ nhé!"},
 "Speaking": {"low": "Nói còn ngập ngừng, nhiều khoảng dừng 'er, um'. Cần luyện dàn ý 1 phút và mở rộng câu trả lời. Chú ý âm cuối -s, -ed.",
              "mid": "Nói khá trôi chảy, đủ thời gian. Từ vựng phù hợp chủ đề nhưng chưa có idiom. Chú ý ngữ điệu khi kết thúc câu.",
              "high": "Trôi chảy, tự nhiên, từ vựng đa dạng và chính xác. Phát âm rõ, ngữ điệu tốt. Có thể thêm 1-2 câu so sánh để bài nói sâu hơn."},
}

def scores(skill, level, k, override=None):
    if override: sc = override
    else:
        pat = [(0,0,0,-0.5),(0.5,0,0,-0.5),(0,-0.5,0.5,0),(0,0.5,-0.5,0),(0.5,0,-0.5,0)][k % 5]
        sc = [clamp(level + p) for p in pat]
    crit = ["Tr","Cc","Lr","Gra"] if skill == "Writing" else ["Fc","Lr","Gra","P"]
    return dict(zip(crit, sc)), overall(sc)

SUBS = []   # dict rows
QA = []     # (subIdx, orderNo, answer)
ANN = []    # (subIdx, phrase, type, suggestion, comment)

def add_sub(**r):
    r.setdefault("attempt", 1); r.setdefault("late", False)
    SUBS.append(r); return len(SUBS)

def writing_sub(a, sno, status, sub_at, k, variant=None, override=None, late=False, attempt=1, content=None, return_note=None, attach=None):
    asg = next(x for x in ASG if x[0] == a)
    lvl = LVL[sno]
    v = variant or var(lvl, [vv for (aa, vv) in ESSAYS if aa == a])
    text = content or ESSAYS[(a, v)]
    sc, ov = scores("Writing", lvl, k, override) if status in ("Draft", "Published") else ({}, None)
    due = asg[5]
    r = dict(a=a, s=sno, content=text, wc=words(text), sub_at=sub_at, status=status, late=late, attempt=attempt,
             sc=sc, ov=ov, fb=FB["Writing"][var(lvl, ["low","mid","high"])] if status in ("Draft","Published") else None,
             graded=AT(due+1, "20:30") if status in ("Draft","Published","Returned") else None,
             published=AT(due+2, "09:15") if status in ("Published","Returned") else None,
             ret=return_note, attach=attach)
    i = add_sub(**r)
    if status in ("Draft", "Published", "Returned") and (a, v) in ANNOTATIONS and content is None:
        for p in ANNOTATIONS[(a, v)]:
            assert p[0] in text, (a, v, p[0]); ANN.append((i,) + p)
    return i

def speaking_sub(a, sno, status, sub_at, k, audio, late=False, fb_audio=None):
    asg = next(x for x in ASG if x[0] == a); lvl = LVL[sno]; due = asg[5]
    sc, ov = scores("Speaking", lvl, k) if status in ("Draft","Published") else ({}, None)
    return add_sub(a=a, s=sno, content=None, audio=audio, wc=0, sub_at=sub_at, status=status, late=late, sc=sc, ov=ov,
                   fb=FB["Speaking"][var(lvl, ["low","mid","high"])] if status in ("Draft","Published") else None,
                   fb_audio=fb_audio, graded=AT(due+1,"21:00") if status in ("Draft","Published") else None,
                   published=AT(due+2,"08:30") if status == "Published" else None)

def quiz_sub(a, sno, sub_at, k):
    qs = QUESTIONS[a]; lvl = LVL[sno]
    ncorrect = max(1, min(5, round((lvl - 3.5) * 1.6)))
    wrong = {(k + j) % 5 for j in range(5 - ncorrect)}
    score = 0; ans = []
    for i, qq in enumerate(qs):
        if i in wrong: ans.append(qq[4])
        else: ans.append(qq[3].split("|")[0]); score += 1
    i = add_sub(a=a, s=sno, content=None, wc=0, sub_at=sub_at, status="Published", auto=score, automax=len(qs),
                graded=sub_at, published=sub_at)
    for n, x in enumerate(ans, 1): QA.append((i, n, x))
    return i

# A1 (C2, due -20): tất cả nộp trừ HV15, đã công bố. HV11 band 6.0 (sau đó giảm)
for k, s in enumerate(ROSTER["C2"]):
    if s == 15: continue
    writing_sub("A1", s, "Published", AT(-21 - (k % 3), ["20:10","22:45","09:30"][k % 3]), k,
                override=[6.0,6.0,6.0,6.0] if s == 11 else None)
# A2 (C2, due -6)
A2_ret = None
for k, s in enumerate(ROSTER["C2"]):
    if s == 15: continue
    if s in (6, 9, 10): writing_sub("A2", s, "Published", AT(-7, ["19:40","21:05","23:10"][k % 3]), k, variant={6:"mid2",9:"low",10:"mid"}[s])
    elif s == 11: writing_sub("A2", s, "Published", AT(-6, "22:50"), k, variant="mid2", override=[5.0,5.0,5.0,5.5])
    elif s == 8: writing_sub("A2", s, "Draft", AT(-7, "15:20"), k, variant="mid")
    elif s == 13: writing_sub("A2", s, "Submitted", AT(-8, "10:15"), k, variant="high")
    elif s == 14: writing_sub("A2", s, "Submitted", AT(-6, "21:30"), k, variant="low")
    elif s == 12: writing_sub("A2", s, "Submitted", AT(-2, "23:40"), k, variant="low", late=True)
    elif s == 16:
        A2_ret = writing_sub("A2", s, "Returned", AT(-7, "22:00"), k, variant="low",
                             return_note="Bài chưa đủ 250 từ và đoạn kết chưa nêu rõ quan điểm. Em viết lại, thêm ví dụ cho mỗi luận điểm rồi nộp lại trước thứ 6 nhé.")
        revised = ESSAYS[("A2","low")].replace("In my opinion, I think university should be free for poor students only.",
            "In my opinion, university should be free for students from poor families, but not for everyone. For example, my cousin in Dong Thap had to stop studying after one year because her parents could not pay the fees. If she had a scholarship, she could finish her degree and help her family.")
        writing_sub("A2", s, "Submitted", AT(-1, "20:15"), k, attempt=2, late=True, content=revised)
# A3 Quiz (C2, due -10): tất cả trừ HV12, HV15
for k, s in enumerate(ROSTER["C2"]):
    if s in (12, 15): continue
    quiz_sub("A3", s, AT(-11 - (k % 2), ["20:30","21:45"][k % 2]), k)
# A4 Speaking (C2, due -3)
speaking_sub("A4", 10, "Published", AT(-4, "21:10"), 0, "/uploads/demo/speaking-01.mp3", fb_audio="/uploads/demo/feedback-speaking-01.mp3")
speaking_sub("A4", 6, "Published", AT(-5, "20:00"), 1, "/uploads/demo/speaking-02.mp3")
speaking_sub("A4", 8, "Submitted", AT(-4, "22:30"), 2, "/uploads/demo/speaking-03.mp3")
speaking_sub("A4", 13, "Submitted", AT(-3, "19:45"), 3, "/uploads/demo/speaking-04.mp3")
# A5 Listening quiz (C2, còn hạn): 4 bạn làm sớm
for k, s in enumerate([6, 10, 13, 9]): quiz_sub("A5", s, AT(-1 + (k // 2), ["19:30","21:00"][k % 2]) if k < 2 else AT(-1, ["10:05","15:40"][k % 2]), k)
# A7 (C3, due -12): tất cả nộp, đã công bố
for k, s in enumerate(ROSTER["C3"]):
    writing_sub("A7", s, "Published", AT(-13 - (k % 2), ["21:20","10:40"][k % 2]), k)
# A8 (C3, due -4)
writing_sub("A8", 1, "Published", AT(-5, "20:00"), 0, variant="low")
writing_sub("A8", 3, "Draft", AT(-5, "16:30"), 1, variant="high")
writing_sub("A8", 4, "Submitted", AT(-5, "22:15"), 2, variant="mid")
writing_sub("A8", 5, "Submitted", AT(-4, "08:40"), 3, variant="high")
writing_sub("A8", 13, "Submitted", AT(-4, "21:55"), 4, variant="mid")
writing_sub("A8", 10, "Submitted", AT(-1, "23:05"), 5, variant="low", late=True)
# A9 (C3, còn hạn): 2 bạn nộp sớm
writing_sub("A9", 3, "Submitted", AT(-1, "21:30"), 0, variant="high")
writing_sub("A9", 5, "Submitted", AT(0, "10:20"), 1, variant="mid")
# A10 Quiz (C1, due -1): tất cả trừ HV7
for k, s in enumerate(ROSTER["C1"]):
    if s == 7: continue
    quiz_sub("A10", s, AT(-2 - (k % 2), ["20:15","21:40"][k % 2]), k)
# A12 Speaking final (C5, due -46): tất cả đã công bố
for k, (s, au) in enumerate(zip(ROSTER["C5"], ["mid2","high","high","low","mid","mid2"])):
    speaking_sub("A12", s, "Published", AT(-47 - (k % 2), "20:30"), k, SPEAKING_AUDIO[au])

# ---------------------------------------------------------------- SQL
w("-- ============================================================================")
w("-- Du lieu demo cho cong Giao vien (teacher@demo.com) - HaDiNa English Center")
w("-- Sinh tu dong boi tools/db/demo (gen_sql.py). Moi ngay gio TINH TU HOM NAY nen chay luc nao cung chan thuc.")
w("-- Chay: tools\\db\\demo\\teacher-demo-data.ps1  (hoac sqlcmd -S localhost -E -d EnglishCenterDb -I -b -f 65001 -i ...)")
w("-- An toan: chi THEM du lieu, chay trong 1 transaction; neu da co hoc vien HV2001 thi bo qua.")
w("-- ============================================================================")
w("SET NOCOUNT ON; SET XACT_ABORT ON;")
w("IF DB_NAME() <> N'EnglishCenterDb' THROW 50001, N'Sai database: hay chay tren EnglishCenterDb', 1;")
w("IF OBJECT_ID(N'dbo.StudentFeedbacks', N'U') IS NULL OR COL_LENGTH(N'dbo.Submissions', N'AttachmentUrl') IS NULL")
w("    THROW 50002, N'DB chua co migration StudentFeedbackAndSubmissionFile. Chay dotnet ef database update truoc.', 1;")
w("IF EXISTS (SELECT 1 FROM Students WHERE Code = N'HV2001') BEGIN PRINT N'Da co du lieu demo (HV2001) - bo qua.'; RETURN; END;")
w("")
w("DECLARE @now datetime2(0) = CAST(GETDATE() AS datetime2(0));")
w("DECLARE @today date = CAST(@now AS date);")
w("DECLARE @tid int, @tuid int, @hash nvarchar(500), @id int;")
w("SELECT @tid = t.Id, @tuid = u.Id, @hash = u.PasswordHash FROM Teachers t JOIN Users u ON u.Id = t.UserId WHERE u.Email = N'teacher@demo.com';")
w("IF @tid IS NULL THROW 50003, N'Khong tim thay tai khoan teacher@demo.com', 1;")
w("DECLARE @c1 int = (SELECT TOP 1 Id FROM Classes WHERE TeacherId = @tid ORDER BY Id);")
w("IF @c1 IS NULL THROW 50004, N'teacher@demo.com chua co lop nao (can du lieu seed goc)', 1;")
w("")
w("BEGIN TRAN;")
w("")
w("-- 1. Ho so giao vien")
w("UPDATE Teachers SET FullName = CASE WHEN FullName = N'Nguyen Van A' THEN N'Nguyễn Văn An' ELSE FullName END,")
w("    Specialty = N'IELTS Writing & Speaking', Degree = N'Thạc sĩ TESOL - ĐH Sư phạm TP.HCM; IELTS 8.0 (W 8.0, S 8.5)',")
w("    HireDate = ISNULL(HireDate, '2023-03-01') WHERE Id = @tid;")
w("")
w("-- 2. Phong hoc, khoa hoc")
for n, cap in ROOMS:
    w(f"IF NOT EXISTS (SELECT 1 FROM Rooms WHERE Name = {q(n)}) INSERT INTO Rooms (Name, Capacity) VALUES ({q(n)}, {cap});")
w("CREATE TABLE #K (K nvarchar(10) PRIMARY KEY, Id int);")
for c in COURSES:
    w(f"IF NOT EXISTS (SELECT 1 FROM Courses WHERE Name = {q(c[1])}) INSERT INTO Courses (Name, Description, BandFrom, BandTo, TotalSessions, SessionsPerWeek, Tuition, DiscountPercent) "
      f"VALUES ({q(c[1])}, {q(c[2])}, {c[3]}, {c[4]}, {c[5]}, {c[6]}, {c[7]}, {c[8]});")
    w(f"INSERT INTO #K VALUES ({q(c[0])}, (SELECT Id FROM Courses WHERE Name = {q(c[1])}));")
w("INSERT INTO #K VALUES (N'C65', (SELECT CourseId FROM Classes WHERE Id = @c1));")
w("")
w("-- 3. Giao an (chi them neu khoa chua co bai nao)")
w("CREATE TABLE #L (K nvarchar(10), OrderNo int, Title nvarchar(250), Descr nvarchar(2000), Taught nvarchar(4000), Homework nvarchar(2000));")
for ck, items in SYL.items():
    for i, (t, d, ct, hw) in enumerate(items, 1):
        w(f"INSERT INTO #L VALUES ({q(ck)}, {i}, {q(t)}, {q(d)}, {q(ct)}, {q(hw)});")
w("INSERT INTO SyllabusLessons (CourseId, OrderNo, Title, Description)")
w("SELECT k.Id, l.OrderNo, l.Title, l.Descr FROM #L l JOIN #K k ON k.K = l.K")
w("WHERE NOT EXISTS (SELECT 1 FROM SyllabusLessons x WHERE x.CourseId = k.Id);")
w("")
w("-- 4. Lop hoc + lich tuan")
w("CREATE TABLE #C (K nvarchar(10) PRIMARY KEY, Id int);")
w("INSERT INTO #C VALUES (N'C1', @c1);")
for (k, ck, name, so, eo, mx, room, url, sch) in CLASSES:
    w(f"INSERT INTO Classes (CourseId, TeacherId, Name, StartDate, EndDate, MaxStudents, MeetingUrl) VALUES "
      f"((SELECT Id FROM #K WHERE K = {q(ck)}), @tid, {q(name)}, {D(so)}, {D(so+eo)}, {mx}, {q(url)}); SET @id = SCOPE_IDENTITY();")
    w(f"INSERT INTO #C VALUES ({q(k)}, @id);")
    for (dw, st, en) in sch:
        w(f"INSERT INTO ClassSchedules (ClassId, RoomId, DayOfWeek, StartTime, EndTime) VALUES ((SELECT Id FROM #C WHERE K = {q(k)}), (SELECT Id FROM Rooms WHERE Name = {q(room)}), {dw}, '{st}', '{en}');")
w("")
w("-- 5. Hoc vien (mat khau giong teacher@demo.com: 123456)")
w("CREATE TABLE #S (No int PRIMARY KEY, Code nvarchar(10), Id int, UserId int, Lvl decimal(3,1));")
for s in STU:
    no, code, fn, em, ph, dob, lvl, tgt, pn, pp, addr = s
    w(f"INSERT INTO Users (Email, PasswordHash, Role, IsLocked, TokenVersion, CreatedAt) VALUES ({q(em)}, @hash, N'student', 0, 0, DATEADD(day,-{100 - no},@now)); SET @id = SCOPE_IDENTITY();")
    w(f"INSERT INTO Students (UserId, Code, FullName, Phone, DateOfBirth, Address, ParentName, ParentPhone, Status, TargetBand, CreatedAt) VALUES "
      f"(@id, {q(code)}, {q(fn)}, {q(ph)}, '{dob}', {q(addr)}, {q(pn)}, {q(pp)}, N'Studying', {tgt}, DATEADD(day,-{100 - no},@now));")
    w(f"INSERT INTO #S SELECT {no}, Code, Id, UserId, {lvl} FROM Students WHERE Code = {q(code)};")
w("")
w("-- 6. Ghi danh")
w("CREATE TABLE #E (C nvarchar(10), No int);")
for ck, ss in ROSTER.items():
    w(f"INSERT INTO #E VALUES " + ", ".join(f"({q(ck)}, {s})" for s in ss) + ";")
w("INSERT INTO Enrollments (StudentId, ClassId, TuitionFee, DiscountPercent, DiscountAmount, FinalTuitionFee, Status, CreatedAt)")
w("SELECT s.Id, c.Id, co.Tuition, co.DiscountPercent, co.Tuition * co.DiscountPercent / 100, co.Tuition - co.Tuition * co.DiscountPercent / 100, N'Active',")
w("       DATEADD(day, -7 - s.No % 5, CAST(cl.StartDate AS datetime2(0)))")
w("FROM #E e JOIN #S s ON s.No = e.No JOIN #C c ON c.K = e.C JOIN Classes cl ON cl.Id = c.Id JOIN Courses co ON co.Id = cl.CourseId")
w("WHERE NOT EXISTS (SELECT 1 FROM Enrollments x WHERE x.StudentId = s.Id AND x.ClassId = c.Id);")
w("")
w("-- 7. Buoi hoc: sinh giong SessionService (tu ngay khai giang theo lich tuan, du tong so buoi). Thu: 1 = Thu Hai")
w(""";WITH n AS (SELECT TOP (220) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1 AS i FROM sys.all_objects),
d AS (SELECT cl.Id AS ClassId, DATEADD(day, n.i, cl.StartDate) AS Dt, co.TotalSessions
      FROM #C c JOIN Classes cl ON cl.Id = c.Id JOIN Courses co ON co.Id = cl.CourseId CROSS JOIN n
      WHERE DATEADD(day, n.i, cl.StartDate) <= cl.EndDate),
s AS (SELECT d.ClassId, d.Dt, cs.StartTime, cs.EndTime, cs.RoomId, d.TotalSessions,
             ROW_NUMBER() OVER (PARTITION BY d.ClassId ORDER BY d.Dt, cs.StartTime) AS No
      FROM d JOIN ClassSchedules cs ON cs.ClassId = d.ClassId AND cs.DayOfWeek = DATEDIFF(day, '19000101', d.Dt) % 7 + 1)
INSERT INTO ClassSessions (ClassId, RoomId, SessionNo, Date, StartTime, EndTime, Type, Status, IsTaught)
SELECT s.ClassId, s.RoomId, s.No, s.Dt, s.StartTime, s.EndTime, N'Regular', N'Scheduled', 0 FROM s
WHERE s.No <= s.TotalSessions
  AND NOT EXISTS (SELECT 1 FROM ClassSessions z WHERE z.ClassId = s.ClassId AND z.Date = s.Dt AND z.StartTime = s.StartTime);""")
w("")
w("-- 8. Buoi da day: gan bai giao an, nhat ky (buoi hom qua / hom nay de trong cho giao vien tu ghi)")
w("""UPDATE cs SET SyllabusLessonId = sl.Id, IsTaught = 1,
    TaughtAt = DATEADD(second, DATEDIFF(second, CAST('00:00' AS time), cs.EndTime), CAST(cs.Date AS datetime2(0))),
    ContentTaught = CASE WHEN cs.Date <= DATEADD(day,-2,@today) THEN l.Taught END,
    Homework = CASE WHEN cs.Date <= DATEADD(day,-2,@today) THEN l.Homework END
FROM ClassSessions cs
JOIN #C c ON c.Id = cs.ClassId
JOIN Classes cl ON cl.Id = cs.ClassId JOIN Courses co ON co.Id = cl.CourseId
CROSS APPLY (SELECT COUNT(*) AS Cnt FROM SyllabusLessons WHERE CourseId = co.Id) cnt
JOIN SyllabusLessons sl ON sl.CourseId = co.Id AND sl.OrderNo = (cs.SessionNo - 1) * cnt.Cnt / co.TotalSessions + 1
JOIN #K k ON k.Id = co.Id
LEFT JOIN #L l ON l.K = k.K AND l.OrderNo = sl.OrderNo
WHERE cs.Status = N'Scheduled' AND cs.SyllabusLessonId IS NULL
  AND DATEADD(second, DATEDIFF(second, CAST('00:00' AS time), cs.EndTime), CAST(cs.Date AS datetime2(0))) <= @now;""")
w("UPDATE ClassSessions SET MeetingUrl = N'https://meet.google.com/hdn-wrt-700' WHERE ClassId = (SELECT Id FROM #C WHERE K = N'C3') AND SessionNo IN (2, 5);")
w("")
w("-- 9. Diem danh: buoi ket thuc tu 2 ngay truoc tro ve (buoi hom qua/hom nay chua diem danh -> hien canh bao tren Dashboard)")
w("""UPDATE cs SET AttendanceTakenAt = DATEADD(minute, 5, DATEADD(second, DATEDIFF(second, CAST('00:00' AS time), cs.EndTime), CAST(cs.Date AS datetime2(0))))
FROM ClassSessions cs JOIN #C c ON c.Id = cs.ClassId
WHERE cs.Status = N'Scheduled' AND cs.Date <= DATEADD(day,-2,@today) AND cs.AttendanceTakenAt IS NULL;
INSERT INTO Attendances (SessionId, StudentId, Status, Note, IsAuto, MarkedAt)
SELECT cs.Id, e.StudentId,
       CASE WHEN h.v < 80 THEN N'Present' WHEN h.v < 89 THEN N'Late' WHEN h.v < 96 THEN N'Absent' ELSE N'Excused' END,
       CASE WHEN h.v BETWEEN 80 AND 88 THEN CONCAT(N'Muộn ', 5 + h.v % 4 * 5, N' phút') WHEN h.v >= 96 THEN N'Phụ huynh báo ốm' END,
       0, cs.AttendanceTakenAt
FROM ClassSessions cs JOIN #C c ON c.Id = cs.ClassId
JOIN Enrollments e ON e.ClassId = cs.ClassId AND e.Status = N'Active'
CROSS APPLY (SELECT ABS(CHECKSUM(cs.Id * 7919 + e.StudentId * 104729)) % 100 AS v) h
WHERE cs.Status = N'Scheduled' AND cs.AttendanceTakenAt IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM Attendances a WHERE a.SessionId = cs.Id AND a.StudentId = e.StudentId);""")
w("-- HV2012 vang 2 buoi gan nhat (lop C2) -> 'Hoc vien can chu y'; HV2016 vang ~1/3 so buoi -> canh bao > 20%")
w("""DECLARE @cC2 int = (SELECT Id FROM #C WHERE K = N'C2');
UPDATE a SET Status = N'Absent', Note = NULL FROM Attendances a JOIN ClassSessions cs ON cs.Id = a.SessionId
WHERE a.StudentId = (SELECT Id FROM #S WHERE No = 12) AND cs.ClassId = @cC2
  AND cs.Id IN (SELECT TOP 2 Id FROM ClassSessions WHERE ClassId = @cC2 AND AttendanceTakenAt IS NOT NULL ORDER BY Date DESC, StartTime DESC);
UPDATE a SET Status = CASE WHEN cs.SessionNo % 3 = 0 THEN N'Absent' ELSE N'Present' END, Note = NULL FROM Attendances a JOIN ClassSessions cs ON cs.Id = a.SessionId
WHERE a.StudentId = (SELECT Id FROM #S WHERE No = 16) AND cs.ClassId = @cC2;
UPDATE a SET Status = N'Excused', Note = N'Đơn xin nghỉ đã duyệt', IsAuto = 1 FROM Attendances a JOIN ClassSessions cs ON cs.Id = a.SessionId
WHERE a.StudentId = (SELECT Id FROM #S WHERE No = 10) AND cs.ClassId = @cC2 AND cs.SessionNo = 5;""")
w("")
w("-- 10. Tai lieu theo buoi (file nam o wwwroot/uploads/demo, script .ps1 tu chep vao)")
MAT = [("C2",1,"Cấu trúc Writing Task 1 - Line graph","Pdf","/uploads/demo/task1-line-graph-structure.pdf"),
       ("C2",2,"Đề mẫu Task 1 - Internet access","Other","/uploads/demo/task1-line-graph.png"),
       ("C2",3,"Reading Passage 1 - The History of Tea","Pdf","/uploads/demo/reading-passage-1.pdf"),
       ("C2",4,"Listening Section 1 - Hotel booking","Audio","/uploads/demo/listening-section1-hotel.mp3"),
       ("C2",7,"Dàn ý Opinion essay (Task 2)","Pdf","/uploads/demo/task2-opinion-essay-guide.pdf"),
       ("C2",9,"Bài nói mẫu Part 2 - Describe a place","Audio","/uploads/demo/speaking-04.mp3"),
       ("C2",11,"Từ vựng chủ đề Education","Pdf","/uploads/demo/vocab-education.pdf"),
       ("C2",11,"British Council - LearnEnglish","Link","https://learnenglish.britishcouncil.org"),
       ("C3",1,"Cấu trúc Writing Task 1 - Line graph","Pdf","/uploads/demo/task1-line-graph-structure.pdf"),
       ("C3",2,"Dàn ý Discussion essay","Pdf","/uploads/demo/task2-opinion-essay-guide.pdf"),
       ("C3",4,"Biểu đồ Task 1 - Leisure activities","Other","/uploads/demo/task1-bar-chart.png"),
       ("C3",5,"Trang chính thức IELTS","Link","https://ielts.org"),
       ("C1",1,"Từ vựng chủ đề Education","Pdf","/uploads/demo/vocab-education.pdf"),
       ("C1",2,"BBC Learning English","Link","https://www.bbc.co.uk/learningenglish"),
       ("C5",3,"Bài nói mẫu - Describe a trip","Audio","/uploads/demo/speaking-04.mp3")]
for ck, no, t, kind, url in MAT:
    w(f"INSERT INTO SessionMaterials (SessionId, Title, Kind, Url, CreatedAt) SELECT cs.Id, {q(t)}, N'{kind}', {q(url)}, "
      f"DATEADD(hour,-3,CAST(cs.Date AS datetime2(0))) FROM ClassSessions cs WHERE cs.ClassId = (SELECT Id FROM #C WHERE K = {q(ck)}) AND cs.SessionNo = {no};")
w("")
w("-- 11. Bai tap + cau hoi Quiz")
w("CREATE TABLE #A (K nvarchar(10) PRIMARY KEY, Id int, Type nvarchar(20));")
for (k, ck, title, skill, typ, due, cr, mw, att, note, late, allc, tg) in ASG:
    w(f"INSERT INTO Assignments (ClassId, TeacherId, Title, Skill, Type, Prompt, DueAt, MinWords, AttachmentUrl, Note, AllowLate, AssignToAll, CreatedAt) VALUES "
      f"((SELECT Id FROM #C WHERE K = {q(ck)}), @tid, {q(title)}, N'{skill}', N'{typ}', {q(PROMPTS[k])}, {DUE(due)}, {num(mw)}, {q(att)}, {q(note)}, {int(late)}, {int(allc)}, {AT(cr, '20:00')}); SET @id = SCOPE_IDENTITY();")
    w(f"INSERT INTO #A VALUES ({q(k)}, @id, N'{typ}');")
    if tg:
        w(f"INSERT INTO AssignmentStudents (AssignmentId, StudentId) SELECT (SELECT Id FROM #A WHERE K = {q(k)}), Id FROM #S WHERE No IN ({','.join(map(str, tg))});")
    for i, (qt, content, opts, corr, _) in enumerate(QUESTIONS.get(k, []), 1):
        w(f"INSERT INTO AssignmentQuestions (AssignmentId, OrderNo, QuestionType, Content, OptionsJson, CorrectAnswer, Points) VALUES "
          f"((SELECT Id FROM #A WHERE K = {q(k)}), {i}, N'{qt}', {q(content)}, {q(json.dumps(opts, ensure_ascii=False)) if opts else 'NULL'}, {q(corr)}, 1);")
w("")
w("-- 12. Bai nop (Writing: bai viet that; Speaking: file ghi am; Quiz: tu cham)")
w("""CREATE TABLE #Sub (X int PRIMARY KEY, A nvarchar(10), No int, AttemptNo int, Content nvarchar(max), AudioUrl nvarchar(500), AttachmentUrl nvarchar(500),
  WordCount int, SubmittedAt datetime2(0), IsLate bit, Status nvarchar(20), Tr decimal(3,1), Cc decimal(3,1), Fc decimal(3,1), Lr decimal(3,1), Gra decimal(3,1), P decimal(3,1),
  Overall decimal(3,1), AutoScore decimal(8,2), AutoMax decimal(8,2), Feedback nvarchar(max), FeedbackAudioUrl nvarchar(500), ReturnNote nvarchar(2000),
  GradedAt datetime2(0), PublishedAt datetime2(0));""")
for i, r in enumerate(SUBS, 1):
    sc = r.get("sc") or {}
    w(f"INSERT INTO #Sub VALUES ({i}, {q(r['a'])}, {r['s']}, {r.get('attempt',1)}, {q(r.get('content'))}, {q(r.get('audio'))}, {q(r.get('attach'))}, "
      f"{r.get('wc',0)}, {r['sub_at']}, {int(r.get('late',False))}, N'{r['status']}', "
      + ", ".join(num(sc.get(c)) for c in ["Tr","Cc","Fc","Lr","Gra","P"]) +
      f", {num(r.get('ov'))}, {num(r.get('auto'))}, {num(r.get('automax'))}, {q(r.get('fb'))}, {q(r.get('fb_audio'))}, {q(r.get('ret'))}, "
      f"{r.get('graded') or 'NULL'}, {r.get('published') or 'NULL'});")
w("""INSERT INTO Submissions (AssignmentId, StudentId, AttemptNo, Content, AudioUrl, AttachmentUrl, WordCount, SubmittedAt, IsLate, Status,
  Tr, Cc, Fc, Lr, Gra, P, OverallBand, AutoScore, AutoMaxScore, Feedback, FeedbackAudioUrl, ReturnNote, GradedAt, PublishedAt)
SELECT a.Id, s.Id, x.AttemptNo, x.Content, x.AudioUrl, x.AttachmentUrl, x.WordCount, x.SubmittedAt, x.IsLate, x.Status,
  x.Tr, x.Cc, x.Fc, x.Lr, x.Gra, x.P, x.Overall, x.AutoScore, x.AutoMax, x.Feedback, x.FeedbackAudioUrl, x.ReturnNote, x.GradedAt, x.PublishedAt
FROM #Sub x JOIN #A a ON a.K = x.A JOIN #S s ON s.No = x.No ORDER BY x.X;
CREATE TABLE #SM (X int PRIMARY KEY, SubId int);
INSERT INTO #SM SELECT x.X, sub.Id FROM #Sub x JOIN #A a ON a.K = x.A JOIN #S s ON s.No = x.No
JOIN Submissions sub ON sub.AssignmentId = a.Id AND sub.StudentId = s.Id AND sub.AttemptNo = x.AttemptNo;""")
w("CREATE TABLE #QA (X int, OrderNo int, Ans nvarchar(200));")
for chunk in range(0, len(QA), 40):
    w("INSERT INTO #QA VALUES " + ", ".join(f"({x}, {n}, {q(a)})" for x, n, a in QA[chunk:chunk+40]) + ";")
w("""UPDATE sub SET AnswersJson = (SELECT N'{' + STRING_AGG(CONCAT(N'"', qq.Id, N'":"', qa.Ans, N'"'), N',') WITHIN GROUP (ORDER BY qq.OrderNo) + N'}'
    FROM #QA qa JOIN AssignmentQuestions qq ON qq.AssignmentId = sub.AssignmentId AND qq.OrderNo = qa.OrderNo WHERE qa.X = m.X)
FROM Submissions sub JOIN #SM m ON m.SubId = sub.Id WHERE EXISTS (SELECT 1 FROM #QA WHERE X = m.X);""")
w("CREATE TABLE #AN (X int, Phrase nvarchar(500), ErrorType nvarchar(20), Suggestion nvarchar(1000), Comment nvarchar(1000));")
for (x, ph, et, sg, cm) in ANN:
    w(f"INSERT INTO #AN VALUES ({x}, {q(ph)}, N'{et}', {q(sg)}, {q(cm)});")
w("""INSERT INTO SubmissionAnnotations (SubmissionId, StartOffset, EndOffset, SelectedText, ErrorType, Suggestion, Comment)
SELECT m.SubId, p.Pos - 1, p.Pos - 1 + LEN(an.Phrase), an.Phrase, an.ErrorType, an.Suggestion, an.Comment
FROM #AN an JOIN #SM m ON m.X = an.X JOIN Submissions sub ON sub.Id = m.SubId
CROSS APPLY (SELECT CHARINDEX(an.Phrase, sub.Content) AS Pos) p WHERE p.Pos > 0;""")
w("")
w("-- 13. Bai kiem tra, diem, trong so")
EXAMS = [  # key, class, title, type, skill, dateOff, minutes, max, results(bool), kind
 ("E1","C2","Kiểm tra định kỳ 1 - Reading & Listening","Periodic","Reading",-14,60,10,True,"ten"),
 ("E2","C2","Thi giữa kỳ - 4 kỹ năng","Midterm",None,5,150,10,False,None),
 ("E3","C3","Kiểm tra Writing định kỳ (Task 2, 40 phút)","Periodic","Writing",-7,40,9,True,"band"),
 ("E4","C1","Kiểm tra đầu vào","Periodic",None,-5,90,10,True,"ten"),
 ("E5","C5","Thi giữa kỳ Speaking","Midterm","Speaking",-63,15,10,True,"ten"),
 ("E6","C5","Thi cuối kỳ Speaking","Final","Speaking",-41,15,10,True,"ten"),
]
w("CREATE TABLE #X (K nvarchar(10) PRIMARY KEY, Id int);")
for (k, ck, t, typ, sk, d, mins, mx, res, kind) in EXAMS:
    w(f"INSERT INTO Exams (ClassId, TeacherId, Title, Type, Skill, ExamDate, DurationMinutes, MaxScore, CreatedAt) VALUES "
      f"((SELECT Id FROM #C WHERE K = {q(ck)}), @tid, {q(t)}, N'{typ}', {q(sk)}, {D(d)}, {mins}, {mx}, {AT(d - 10, '21:00')}); SET @id = SCOPE_IDENTITY();")
    w(f"INSERT INTO #X VALUES ({q(k)}, @id);")
    if res:
        rows = []
        for j, s in enumerate(ROSTER[ck]):
            lvl = LVL[s]; jit = [0, 0.5, -0.5, 0.25, 0][j % 5]
            sc = round(min(9, max(4, lvl + jit)) * 2) / 2 if kind == "band" else round(min(10, max(3.5, lvl * 1.4 - 1.2 + jit)), 1)
            if s == 15 and kind == "ten": sc = 4.0
            note = "Vắng thi, làm bài bù" if (ck, s) == ("C2", 12) else None
            rows.append(f"({s}, {sc}, {q(note)})")
        w(f"INSERT INTO ExamResults (ExamId, StudentId, Score, Note, Source, UpdatedAt) SELECT (SELECT Id FROM #X WHERE K = {q(k)}), s.Id, v.Sc, v.Note, N'Manual', {AT(d + 2, '20:00')} "
          f"FROM (VALUES {', '.join(rows)}) v(No, Sc, Note) JOIN #S s ON s.No = v.No;")
for ck, aw, pw, mw, fw in [("C2",20,10,30,40),("C3",40,20,0,40),("C5",30,0,30,40)]:
    w(f"INSERT INTO GradeConfigs (ClassId, AssignmentWeight, PeriodicWeight, MidtermWeight, FinalWeight, PassScore) VALUES ((SELECT Id FROM #C WHERE K = {q(ck)}), {aw}, {pw}, {mw}, {fw}, 5);")
w("")
w("-- 14. Nhan xet dinh ky, de xuat len lop")
REV = [  # class, student, period, label, attitude, attendance, strengths, improvements, L, R, W, S, overall, dayOff
 ("C2",9,"Monthly","10/2026","Chăm chỉ, hay hỏi bài.","Đi học đầy đủ.","Listening tiến bộ rõ, nghe số và tên riêng tốt.","Writing còn nhiều lỗi chia động từ.","Nghe Section 1 ổn định 8/10.","Cần luyện thêm TFNG.","Viết đủ ý nhưng câu đơn giản.","Phát âm rõ, còn ngập ngừng.",None,-8),
 ("C2",10,"Monthly","10/2026","Tích cực phát biểu, làm bài đầy đủ.","Nghỉ 1 buổi có phép.","Speaking trôi chảy, tự tin.","Cần đa dạng từ nối trong Writing.","Tốt.","Đọc nhanh, đúng 4/5 câu.","Bố cục rõ ràng.","Nói đủ 2 phút, ít lỗi.",None,-8),
 ("C2",11,"Monthly","10/2026","Có cố gắng nhưng gần đây thiếu tập trung.","Đi học đầy đủ.","Từ vựng khá.","Band Writing vừa giảm xuống 5.0, cần xem lại cách lập dàn ý.","Ổn.","Ổn.","Bài Task 2 gần nhất lạc ý ở thân bài 2.","Khá.",None,-8),
 ("C2",12,"Monthly","10/2026","Còn rụt rè, ít tương tác.","Vắng nhiều, 2 buổi gần nhất vắng không phép.","Chịu khó ghi chép.","Cần đi học đều và nộp bài đúng hạn.","Còn yếu Section 2.","Chưa làm bài Quiz.","Bài nộp trễ, dưới số từ yêu cầu.","Chưa nộp bài Speaking.",None,-8),
 ("C2",16,"Monthly","10/2026","Hiểu bài nhanh.","Vắng khoảng 1/3 số buổi, đã nhắc phụ huynh.","Ý tưởng tốt.","Cần đi học đều hơn; viết lại bài Task 2 theo góp ý.","Khá.","Khá.","Bài Task 2 thiếu số từ, đã trả bài sửa.","Chưa nộp.",None,-8),
 ("C3",1,"MidCourse","Giữa khóa","Rất nghiêm túc.","Đầy đủ.","Task 2 lập luận tốt.","Task 1 cần overview rõ hơn, còn lỗi chia động từ.",None,None,"Band 6.0 - 6.5, mục tiêu 7.0 khả thi.",None,"Đúng tiến độ, cần luyện thêm Task 1.",-5),
 ("C3",13,"MidCourse","Giữa khóa","Chủ động, hay hỏi.","Đầy đủ.","Từ vựng học thuật tốt.","Quản lý thời gian khi viết 60 phút.",None,None,"Ổn định 6.0 - 6.5.",None,"Tiến bộ tốt.",-5),
]
for (ck, s, per, lab, att, atc, st, im, li, rd, wr, sp, ov, d) in REV:
    w(f"INSERT INTO StudentReviews (StudentId, ClassId, TeacherId, Period, PeriodLabel, Attitude, AttendanceComment, Strengths, Improvements, ListeningComment, ReadingComment, WritingComment, SpeakingComment, OverallComment, CreatedAt) VALUES "
      f"((SELECT Id FROM #S WHERE No = {s}), (SELECT Id FROM #C WHERE K = {q(ck)}), @tid, N'{per}', {q(lab)}, {q(att)}, {q(atc)}, {q(st)}, {q(im)}, {q(li)}, {q(rd)}, {q(wr)}, {q(sp)}, {q(ov)}, {AT(d, '22:00')});")
END = {1: ("Phát âm rõ, trôi chảy.","Mở rộng Part 3.","Đạt 6.0, đủ điều kiện học Writing 7.0."),
       3: ("Xuất sắc, tự nhiên.","Thêm idiom.","Đạt 7.0, nên lên lớp IELTS 6.5 nâng cao."),
       5: ("Trôi chảy, từ vựng tốt.","Ngữ điệu.","Đạt 6.5."),
       9: ("Tiến bộ nhiều về phản xạ.","Còn lỗi thì quá khứ.","Đạt 5.5, nên học tiếp khóa Foundation."),
       10: ("Tự tin, đủ thời gian.","Âm cuối -ed.","Đạt 6.0."),
       13: ("Ý tưởng phong phú.","Tốc độ nói hơi nhanh.","Đạt 6.5.")}
for s, (st, im, ov) in END.items():
    w(f"INSERT INTO StudentReviews (StudentId, ClassId, TeacherId, Period, PeriodLabel, Attitude, AttendanceComment, Strengths, Improvements, SpeakingComment, OverallComment, CreatedAt) VALUES "
      f"((SELECT Id FROM #S WHERE No = {s}), (SELECT Id FROM #C WHERE K = N'C5'), @tid, N'EndCourse', N'Cuối khóa', N'Tích cực, đúng giờ.', N'Đi học đầy đủ.', {q(st)}, {q(im)}, {q(st)}, {q(ov)}, {AT(-40, '21:30')});")
for s, ck, st, reason, d in [(1,"WRIT","Pending","Speaking đạt 6.0, Writing là kỹ năng yếu nhất, nên học Writing Intensive.",-39),
                             (3,"C65","Accepted","Đạt 7.0 Speaking, đủ trình độ lớp IELTS 6.5.",-40),
                             (9,"FOUND","Accepted","Cần củng cố nền tảng trước khi lên 6.5.",-40)]:
    w(f"INSERT INTO PromotionRecommendations (StudentId, FromClassId, TeacherId, RecommendedCourseId, Reason, Status, CreatedAt) VALUES "
      f"((SELECT Id FROM #S WHERE No = {s}), (SELECT Id FROM #C WHERE K = N'C5'), @tid, (SELECT Id FROM #K WHERE K = {q(ck)}), {q(reason)}, N'{st}', {AT(d, '10:00')});")
w("")
w("-- 15. Danh gia & phan hoi tu hoc vien")
RAT = [(1,"C3",5,"Cô chữa bài rất kỹ, chỉ ra lỗi cụ thể.",-6),(3,"C5",5,"Lớp Speaking rất vui, em tự tin hơn hẳn.",-40),(5,"C3",5,None,-6),
       (9,"C2",4,"Giảng dễ hiểu, mong cô cho thêm bài tập Listening.",-9),(10,"C2",5,"Nhận xét bằng giọng nói rất hữu ích!",-2),
       (11,"C2",3,"Bài tập hơi nhiều so với thời gian của em.",-7),(13,"C5",5,"Cô nhiệt tình, phản hồi nhanh.",-40),
       (6,"C2",4,"Nên có thêm tài liệu từ vựng.",-10),(2,"C1",5,"Buổi đầu rất cuốn hút.",-4),(4,"C3",4,"Lớp cuối tuần hơi dài nhưng hiệu quả.",-5)]
for s, ck, sc, cm, d in RAT:
    w(f"INSERT INTO TeacherRatings (TeacherId, StudentId, ClassId, Score, Comment, CreatedAt) VALUES (@tid, (SELECT Id FROM #S WHERE No = {s}), (SELECT Id FROM #C WHERE K = {q(ck)}), {sc}, {q(cm)}, {AT(d, '21:15')});")
FBK = [(9,"C2","Em mong có thêm buổi luyện Listening Section 3-4 trước kỳ thi giữa kỳ.",-6),
       (12,"C2","Em hay bị ốm nên nghỉ nhiều, cô có thể gửi tài liệu các buổi em vắng không ạ?",-2),
       (16,"C2","Em đã viết lại bài Task 2 theo góp ý, cảm ơn cô.",-1),
       (1,"C3","Cô có thể chia sẻ thêm bài mẫu band 7.5 cho dạng Problem - Solution không ạ?",-3),
       (13,"C3","Lớp online buổi Chủ nhật rất tiện, mong duy trì link Meet cố định.",-8),
       (5,"C3","Phòng P202 hơi nóng vào buổi chiều thứ 7.",-9),
       (2,"C1","Em thích cách cô dạy từ vựng theo collocation.",-3),
       (8,"C1","Mong lớp có thêm hoạt động nói theo nhóm.",-2)]
for s, ck, ct, d in FBK:
    w(f"INSERT INTO StudentFeedbacks (StudentId, ClassId, TeacherId, Content, CreatedAt) VALUES ((SELECT Id FROM #S WHERE No = {s}), (SELECT Id FROM #C WHERE K = {q(ck)}), @tid, {q(ct)}, {AT(d, '20:45')});")
w("")
w("-- 16. Lich ranh 1 kem 1 (14 ngay toi, sang T2-T4-T6), buoi 1 kem 1, yeu cau cua hoc vien")
w("""CREATE TABLE #V (Rn int PRIMARY KEY, Id int);
;WITH n AS (SELECT TOP (14) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS i FROM sys.all_objects),
d AS (SELECT TOP (5) DATEADD(day, n.i, @today) AS Dt FROM n WHERE DATEDIFF(day, '19000101', DATEADD(day, n.i, @today)) % 7 + 1 IN (1, 3, 5) ORDER BY n.i)
INSERT INTO TeacherAvailabilities (TeacherId, Date, StartTime, EndTime, Note, IsBooked)
SELECT @tid, d.Dt, t.S, t.E, t.Note, 0 FROM d CROSS JOIN (VALUES (CAST('09:00' AS time), CAST('10:00' AS time), N'Ưu tiên chữa bài Writing'), (CAST('10:15' AS time), CAST('11:15' AS time), N'Luyện Speaking')) t(S, E, Note)
ORDER BY d.Dt, t.S;
INSERT INTO #V SELECT ROW_NUMBER() OVER (ORDER BY Date, StartTime), Id FROM TeacherAvailabilities WHERE TeacherId = @tid AND Date > @today AND IsBooked = 0;
INSERT INTO TeacherAvailabilities (TeacherId, Date, StartTime, EndTime, Note, IsBooked) VALUES (@tid, DATEADD(day,-4,@today), '09:00', '10:00', N'Chữa bài', 1), (@tid, DATEADD(day,-11,@today), '09:00', '10:00', N'Chữa bài', 1);
DECLARE @past1 int = (SELECT Id FROM TeacherAvailabilities WHERE TeacherId = @tid AND Date = DATEADD(day,-4,@today) AND StartTime = '09:00');
DECLARE @past2 int = (SELECT Id FROM TeacherAvailabilities WHERE TeacherId = @tid AND Date = DATEADD(day,-11,@today) AND StartTime = '09:00');""")
def req(no, typ, ck, status, reason, created, session_sql="NULL", av_sql="NULL", date_sql="NULL", st="NULL", en="NULL", note=None, processed="NULL"):
    w(f"INSERT INTO StudentRequests (StudentId, TeacherId, Type, ClassId, SessionId, AvailabilityId, Date, StartTime, EndTime, Reason, Status, ResponseNote, CreatedAt, ProcessedAt) VALUES "
      f"((SELECT Id FROM #S WHERE No = {no}), @tid, N'{typ}', {'(SELECT Id FROM #C WHERE K = ' + q(ck) + ')' if ck else 'NULL'}, {session_sql}, {av_sql}, {date_sql}, {st}, {en}, {q(reason)}, N'{status}', {q(note)}, {created}, {processed});")
NEXT = lambda ck: f"(SELECT TOP 1 Id FROM ClassSessions WHERE ClassId = (SELECT Id FROM #C WHERE K = {q(ck)}) AND Date > @today ORDER BY Date, StartTime)"
BYNO = lambda ck, n: f"(SELECT Id FROM ClassSessions WHERE ClassId = (SELECT Id FROM #C WHERE K = {q(ck)}) AND SessionNo = {n})"
AV = lambda rn: f"(SELECT Id FROM #V WHERE Rn = {rn})"
AVF = lambda rn, col: f"(SELECT {col} FROM TeacherAvailabilities WHERE Id = (SELECT Id FROM #V WHERE Rn = {rn}))"
req(12, "Leave", "C2", "Pending", "Em bị sốt từ tối qua, xin phép cô cho em nghỉ buổi này ạ.", AT(0, "07:30"), NEXT("C2"))
req(5, "Leave", "C1", "Pending", "Em có lịch thi học kỳ ở trường trùng giờ học.", AT(-1, "19:10"), NEXT("C1"))
req(3, "Reschedule", "C3", "Pending", "Em đi công tác cuối tuần này, xin học bù vào buổi tối thứ 5 nếu được.", AT(-1, "09:00"), NEXT("C3"))
req(10, "Leave", "C2", "Approved", "Em về quê dự đám cưới chị gái.", AT(-30, "20:00"), BYNO("C2", 5), note="Nhớ xem lại tài liệu buổi học và làm bài tập về nhà nhé.", processed=AT(-30, "21:30"))
req(16, "Leave", "C2", "Rejected", "Em ngủ quên nên không đi học được ạ.", AT(-22, "21:00"), BYNO("C2", 8), note="Đơn gửi sau giờ học nên không duyệt được. Lần sau em báo trước buổi học nhé.", processed=AT(-21, "08:00"))
req(9, "OneOnOneBooking", "C2", "Pending", "Em muốn luyện Speaking Part 3 trước kỳ thi giữa kỳ.", AT(0, "08:15"), av_sql=AV(2), date_sql=AVF(2,"Date"), st=AVF(2,"StartTime"), en=AVF(2,"EndTime"))
req(11, "OneOnOneBooking", "C2", "Pending", "Em muốn hỏi cách cải thiện Writing Task 2 vì band vừa bị giảm.", AT(-1, "22:40"), av_sql=AV(5), date_sql=AVF(5,"Date"), st=AVF(5,"StartTime"), en=AVF(5,"EndTime"))
for no, rn, topic, ck in [(10, 1, "Luyện Speaking Part 2 - phát âm âm cuối", "C2"), (4, 4, "Chiến thuật Writing Task 1 bar chart", "C3")]:
    req(no, "OneOnOneBooking", ck, "Approved", topic, AT(-2, "20:00"), av_sql=AV(rn), date_sql=AVF(rn,"Date"), st=AVF(rn,"StartTime"), en=AVF(rn,"EndTime"),
        note="Cô xác nhận, link Meet gửi trong lịch.", processed=AT(-2, "21:00"))
    w(f"UPDATE TeacherAvailabilities SET IsBooked = 1 WHERE Id = {AV(rn)};")
    w(f"INSERT INTO OneOnOneSessions (TeacherId, StudentId, AvailabilityId, RequestId, Date, StartTime, EndTime, Topic, MeetingUrl, Status, CreatedAt) "
      f"SELECT @tid, (SELECT Id FROM #S WHERE No = {no}), av.Id, (SELECT MAX(Id) FROM StudentRequests WHERE StudentId = (SELECT Id FROM #S WHERE No = {no}) AND Type = N'OneOnOneBooking'), "
      f"av.Date, av.StartTime, av.EndTime, {q(topic)}, N'https://meet.google.com/hdn-1on1-{no:02d}', N'Scheduled', {AT(-2, '21:00')} FROM TeacherAvailabilities av WHERE av.Id = {AV(rn)};")
for no, var_, topic, ck, d in [(13, "@past1", "Sửa bài Writing Task 2 - Technology", "C3", -4), (1, "@past2", "Chữa bài Task 1 line graph", "C3", -11)]:
    req(no, "OneOnOneBooking", ck, "Approved", topic, AT(d - 3, "20:00"), av_sql=var_, date_sql=D(d), st="'09:00'", en="'10:00'", note="Cô xác nhận.", processed=AT(d - 3, "21:00"))
    w(f"INSERT INTO OneOnOneSessions (TeacherId, StudentId, AvailabilityId, RequestId, Date, StartTime, EndTime, Topic, MeetingUrl, Status, CreatedAt) VALUES "
      f"(@tid, (SELECT Id FROM #S WHERE No = {no}), {var_}, (SELECT MAX(Id) FROM StudentRequests WHERE StudentId = (SELECT Id FROM #S WHERE No = {no}) AND Type = N'OneOnOneBooking'), "
      f"{D(d)}, '09:00', '10:00', {q(topic)}, N'https://meet.google.com/hdn-1on1-{no:02d}', N'Scheduled', {AT(d - 3, '21:00')});")
w("")
w("-- 17. Thong bao giao vien gui lop + chuong thong bao cua giao vien")
ANNC = [("C2","Lịch thi giữa kỳ lớp Foundation","Thi giữa kỳ 4 kỹ năng vào buổi học tuần sau, mang theo bút chì và tai nghe. Phòng P201.",-2),
        ("C2","Nhắc nộp bài Speaking Part 2","Các bạn chưa nộp bài Speaking Part 2 vui lòng nộp trước 23:59 tối nay. Bài trễ vẫn được chấm nhưng bị đánh dấu Trễ.",-4),
        ("C3","Buổi Chủ nhật học online","Buổi sáng Chủ nhật lớp học qua Google Meet, link đã gắn ở buổi học. Các bạn vào sớm 5 phút để kiểm tra mic.",-6),
        ("C1","Chào mừng lớp IELTS 6.5","Chào mừng các bạn đến với lớp IELTS 6.5! Tài liệu từ vựng buổi 1 đã đăng ở mục Tài liệu. Hẹn gặp các bạn thứ Hai.",-7),
        ("C5","Kết thúc khóa Speaking 6.0","Cảm ơn các bạn đã đồng hành. Phiếu nhận xét cuối khóa đã được cập nhật, các bạn xem trong mục Feedback nhé.",-40)]
for ck, t, ct, d in ANNC:
    w(f"INSERT INTO Announcements (TeacherId, ClassId, Title, Content, RecipientCount, CreatedAt) VALUES (@tid, (SELECT Id FROM #C WHERE K = {q(ck)}), {q(t)}, {q(ct)}, "
      f"(SELECT COUNT(*) FROM Enrollments WHERE ClassId = (SELECT Id FROM #C WHERE K = {q(ck)}) AND Status = N'Active'), {AT(d, '19:00')}); SET @id = SCOPE_IDENTITY();")
    w(f"INSERT INTO Notifications (RecipientUserId, SenderUserId, AnnouncementId, Type, Title, Content, Link, IsRead, CreatedAt) "
      f"SELECT st.UserId, @tuid, @id, N'Announcement', {q(t)}, {q(ct)}, N'/student/notifications', CASE WHEN ABS(CHECKSUM(st.Id)) % 3 = 0 THEN 0 ELSE 1 END, {AT(d, '19:00')} "
      f"FROM Enrollments e JOIN Students st ON st.Id = e.StudentId WHERE e.ClassId = (SELECT Id FROM #C WHERE K = {q(ck)}) AND e.Status = N'Active';")
def subidx(a, s, att=1):
    return next(i for i, r in enumerate(SUBS, 1) if r["a"] == a and r["s"] == s and r.get("attempt", 1) == att)
TN = [("Submission", f"{NAME[14]} vừa nộp bài \"Writing Task 2 - Should university education be free?\"", None, ("sub", subidx("A2",14)), 0, AT(-6,"21:30")),
      ("Submission", f"{NAME[12]} vừa nộp bài \"Writing Task 2 - Should university education be free?\"", "Nộp trễ hạn", ("sub", subidx("A2",12)), 0, AT(-2,"23:40")),
      ("Submission", f"{NAME[16]} vừa nộp bài \"Writing Task 2 - Should university education be free?\" (lần 2)", "Nộp trễ hạn", ("sub", subidx("A2",16,2)), 0, AT(-1,"20:15")),
      ("Submission", f"{NAME[13]} vừa nộp bài \"Writing Task 1 - Leisure activities (bar chart)\"", None, ("sub", subidx("A8",13)), 1, AT(-4,"21:55")),
      ("Submission", f"{NAME[10]} vừa nộp bài \"Writing Task 1 - Leisure activities (bar chart)\"", "Nộp trễ hạn", ("sub", subidx("A8",10)), 0, AT(-1,"23:05")),
      ("Submission", f"{NAME[13]} vừa nộp bài \"Speaking Part 2 - Describe a place you like to visit\"", None, ("sub", subidx("A4",13)), 1, AT(-3,"19:45")),
      ("Request", f"{NAME[12]} xin nghỉ buổi học", "Em bị sốt từ tối qua, xin phép cô cho em nghỉ buổi này ạ.", ("link", "/teacher/requests"), 0, AT(0,"07:30")),
      ("Request", f"{NAME[9]} đặt lịch học 1 kèm 1", "Em muốn luyện Speaking Part 3 trước kỳ thi giữa kỳ.", ("link", "/teacher/requests"), 0, AT(0,"08:15")),
      ("Request", f"{NAME[11]} đặt lịch học 1 kèm 1", None, ("link", "/teacher/requests"), 1, AT(-1,"22:40")),
      ("System", "Bạn được phân công lớp IELTS 6.5 - Lớp sáng 3-5", "Lớp khai giảng sau 9 ngày, 6 học viên đã ghi danh.", ("class", "C4"), 1, AT(-3,"10:00")),
      ("Reminder", "Còn buổi học chưa điểm danh", "Điểm danh sẽ khóa sau 48 giờ kể từ khi buổi học kết thúc.", ("link", "/teacher/dashboard"), 0, AT(0,"08:00")),
      ("Request", f"{NAME[3]} xin đổi buổi học", "Em đi công tác cuối tuần này.", ("link", "/teacher/requests"), 1, AT(-1,"09:00"))]
for typ, t, ct, (lk, lv), rd, at in TN:
    link = f"CONCAT(N'/teacher/grading/', (SELECT SubId FROM #SM WHERE X = {lv}))" if lk == "sub" else (f"CONCAT(N'/teacher/classes/', (SELECT Id FROM #C WHERE K = {q(lv)}))" if lk == "class" else q(lv))
    w(f"INSERT INTO Notifications (RecipientUserId, Type, Title, Content, Link, IsRead, CreatedAt) VALUES (@tuid, N'{typ}', {q(t)}, {q(ct)}, {link}, {rd}, {at});")
w("")
w("-- 18. Nhan xet mau rieng cua giao vien")
for sk, cr, ct in [("Writing","TR","Overview chưa nêu được xu hướng chính, hãy so sánh điểm đầu và điểm cuối của mỗi đường."),
                   ("Writing","CC","Mỗi đoạn thân bài nên bắt đầu bằng 1 câu chủ đề rõ ràng."),
                   ("Writing",None,"Bài viết đã tiến bộ so với lần trước, tiếp tục phát huy!"),
                   ("Speaking","P","Chú ý phát âm âm /θ/ và /ð/ (think, this).")]:
    w(f"INSERT INTO CommentTemplates (TeacherId, Skill, Criterion, Content) VALUES (@tid, N'{sk}', {q(cr)}, {q(ct)});")
w("")
w("COMMIT;")
w("")
w("PRINT N'Đã tạo dữ liệu demo cho teacher@demo.com:';")
w("""SELECT N'Lớp' AS Loai, COUNT(*) AS SoLuong FROM Classes WHERE TeacherId = @tid
UNION ALL SELECT N'Học viên mới (HV2001-HV2016)', COUNT(*) FROM #S
UNION ALL SELECT N'Buổi học', COUNT(*) FROM ClassSessions cs JOIN Classes c ON c.Id = cs.ClassId WHERE c.TeacherId = @tid
UNION ALL SELECT N'Điểm danh', COUNT(*) FROM Attendances a JOIN ClassSessions cs ON cs.Id = a.SessionId JOIN Classes c ON c.Id = cs.ClassId WHERE c.TeacherId = @tid
UNION ALL SELECT N'Bài giáo án', COUNT(*) FROM SyllabusLessons WHERE CourseId IN (SELECT Id FROM #K)
UNION ALL SELECT N'Tài liệu', COUNT(*) FROM SessionMaterials m JOIN ClassSessions cs ON cs.Id = m.SessionId JOIN Classes c ON c.Id = cs.ClassId WHERE c.TeacherId = @tid
UNION ALL SELECT N'Bài tập', COUNT(*) FROM Assignments WHERE TeacherId = @tid
UNION ALL SELECT N'Bài nộp', COUNT(*) FROM Submissions s JOIN Assignments a ON a.Id = s.AssignmentId WHERE a.TeacherId = @tid
UNION ALL SELECT N'Bài kiểm tra', COUNT(*) FROM Exams WHERE TeacherId = @tid
UNION ALL SELECT N'Nhận xét học viên', COUNT(*) FROM StudentReviews WHERE TeacherId = @tid
UNION ALL SELECT N'Yêu cầu học viên', COUNT(*) FROM StudentRequests WHERE TeacherId = @tid
UNION ALL SELECT N'Thông báo cho giáo viên', COUNT(*) FROM Notifications WHERE RecipientUserId = @tuid;""")

# Cot chu trong bang tam theo collation cua DB (tranh loi "collation conflict" khi DB khac collation server)
L = [re.sub(r"(nvarchar\((?:\d+|max)\))", r"\1 COLLATE DATABASE_DEFAULT", x) if x.lstrip().startswith("CREATE TABLE #") else x for x in L]
open(OUT, "w", encoding="utf-8").write("\n".join(L) + "\n")
print("rows:", len(SUBS), "annotations:", len(ANN), "quiz answers:", len(QA), "lines:", len(L))
for (a, v), t in ESSAYS.items(): print(a, v, words(t))
