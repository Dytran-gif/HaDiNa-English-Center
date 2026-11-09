"""Bài viết mẫu của học viên theo từng đề và mức band (low / mid / mid2 / high)."""

PROMPTS = {
    "A1": "The line graph below shows the percentage of households with internet access in Viet Nam, Thailand and Japan between 2000 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    "A2": "Some people think that university education should be free for everyone, while others believe that students should pay for their own studies.\n\nDiscuss both views and give your own opinion. Write at least 250 words.",
    "A4": "Describe a place you like to visit.\nYou should say:\n- where it is\n- how often you go there\n- what you do there\nand explain why you like this place.\n\nThu âm 1.5 - 2 phút, nói liền mạch, không đọc từ giấy.",
    "A6": "Some people think that working from home is more productive than working in an office, while others disagree.\n\nDiscuss both views and give your own opinion. Write at least 250 words.",
    "A7": "Some people believe that technology has made learning easier, while others think it has made students lazy and less able to concentrate.\n\nDiscuss both views and give your own opinion. Write at least 250 words.",
    "A8": "The bar chart below shows the average number of hours per week that people in four age groups spent on different leisure activities in 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    "A9": "Traffic congestion is becoming a serious problem in many big cities.\n\nWhat are the causes of this problem, and what measures can be taken to solve it? Write at least 250 words.",
    "A11": "Speaking Part 1 - trả lời 4 câu hỏi, mỗi câu 20-30 giây:\n1. Where is your hometown?\n2. What do you like most about it?\n3. Do you work or are you a student?\n4. What subject do you enjoy studying the most? Why?",
    "A12": "Describe a memorable trip you have taken.\nYou should say:\n- where you went\n- who you went with\n- what you did there\nand explain why it was memorable.\n\nBài thi Speaking cuối khóa: thu âm 2 phút.",
}

ESSAYS = {
    ("A1", "low"): """The line graph show the percentage of households which have internet access in three country, Viet Nam, Thailand and Japan, from 2000 to 2020.

Overall, the number of household with internet increased in all three countries. Japan always had the highest percentage.

In 2000, Japan was 34%, Thailand was 5% and Viet Nam was only 2%. After that, Japan increase quickly to 71% in 2008 and reached 93% in 2020.

Thailand and Viet Nam also grew. Thailand went up to 45% in 2012 and 80% in 2020. Viet Nam was lower than Thailand in all years, it rise from 2% to 74% at the end of the period.

In conclusion, internet is more popular in the three countries in 2020 than in 2000.""",
    ("A1", "mid"): """The line graph illustrates the proportion of households with access to the internet in Viet Nam, Thailand and Japan between 2000 and 2020.

Overall, all three countries saw a significant increase in internet access over the period. Japan had the highest figure throughout, while Viet Nam recorded the most dramatic growth.

In 2000, around a third of Japanese households (34%) were connected to the internet, compared with only 5% in Thailand and 2% in Viet Nam. The figure for Japan rose steadily to 71% in 2008 and then increased more slowly, reaching 93% in 2020.

Thailand and Viet Nam followed a similar pattern. The percentage of Thai households with internet climbed to 45% in 2012 and finally 80% in 2020. Meanwhile, Viet Nam started from the lowest point but grew rapidly, especially after 2008, and the figure reached 74% at the end of the period, only six percent lower than Thailand.""",
    ("A1", "high"): """The line graph compares the percentage of homes with internet access in three Asian countries, namely Viet Nam, Thailand and Japan, over a twenty-year period starting in 2000.

It is clear that internet access became far more widespread in all three nations. While Japan consistently had the highest rate of connected households, the gap between it and the other two countries narrowed considerably by 2020.

At the beginning of the period, just over a third of Japanese households (34%) had internet access, whereas the figures for Thailand and Viet Nam were negligible, at 5% and 2% respectively. Japan then experienced rapid growth until 2008, when the rate stood at 71%, before levelling off and peaking at 93% in 2020.

By contrast, Thailand and Viet Nam saw their most significant increases in the second half of the period. The proportion of Thai households online rose more than fifteen-fold to reach 80%, while Viet Nam showed the most remarkable growth of all, climbing from a mere 2% to almost three quarters of households (74%) in 2020.""",

    ("A2", "low"): """Nowaday, education is very important for everyone. Some people think university should be free, but other people think student must pay tuition fee. In this essay I will discuss both view.

Firstly, free university is good because poor student can study. In Viet Nam, a lot of family in the countryside do not have enough money to pay for their children. If university is free, they can go to university and have a better job in the future. This is good for the country too.

Secondly, some people think student should pay because the government do not have enough money. The money can use for hospital or road. Also, if student pay money, they will study harder because they do not want to waste money.

In my opinion, I think university should be free for poor students only. Rich family can pay the tuition fee. In conclusion, both views have reason but I think the government should help poor student.""",
    ("A2", "mid"): """Higher education plays a key role in helping young people build their careers. While some people argue that university should be free for everyone, others believe that students should pay for their own studies. This essay will discuss both views before giving my opinion.

On the one hand, there are several reasons why tuition-free university is beneficial. The most important one is that it gives equal opportunities to students from low-income families. In many developing countries, talented students have to give up their dream of studying at university because they cannot afford the fees. If higher education were free, these students could develop their potential and contribute more to society. In addition, a more educated workforce would help the economy to grow in the long term.

On the other hand, opponents claim that free university education would put too much pressure on the national budget. Governments have to spend money on many other important areas, such as healthcare and infrastructure. Moreover, when students pay for their education, they tend to value it more and study more seriously, so fewer students would drop out.

In my opinion, university should not be completely free, but governments should offer scholarships and low-interest loans to students who are in financial difficulty. This approach would make sure that money is not a barrier to education while still keeping the system sustainable.

In conclusion, although free university education has clear advantages, I believe a combination of tuition fees and financial support is the most practical solution.""",
    ("A2", "mid2"): """It is often argued that university education should be provided free of charge, whereas others think that students ought to pay tuition fees. Both sides have their own reasons, and I will examine them in this essay.

People who support free university believe that education is a basic right. They argue that everyone should have the chance to study, regardless of how much money their parents earn. For example, in Germany, public universities do not charge tuition fees, and this has attracted many international students and improved the quality of research. Free education also reduce the gap between the rich and the poor.

However, there are also strong arguments for making students pay. First, running a university is very expensive, and the money has to come from somewhere. If the government pays for everything, taxes will increase for all citizens, even those who never go to university. Second, graduates usually earn higher salaries, so it seems fair that they contribute to the cost of their own degree.

Personally, I believe that students should pay a reasonable fee, but the government needs to support those who cannot afford it. Scholarships for excellent students and grants for poor families are effective ways to achieve this balance.

To sum up, free university education can make society fairer, but it is costly. A system where students pay part of the cost, with support for disadvantaged groups, would be the best choice in my view.""",
    ("A2", "high"): """Whether higher education should be funded entirely by the state or paid for by students themselves is a contentious issue. While I acknowledge the merits of charging tuition fees, I am convinced that university education should be free, at least for undergraduate degrees.

Those in favour of tuition fees put forward two main arguments. Firstly, graduates are the primary beneficiaries of their degrees, as they typically go on to secure better-paid and more stable jobs; it therefore seems reasonable that they bear at least part of the cost. Secondly, fees provide universities with a reliable source of income, which can be invested in facilities, research and teaching staff without placing an additional burden on taxpayers.

Nevertheless, I believe the case for free university education is more compelling. The most significant benefit is social mobility. When fees are high, gifted students from disadvantaged backgrounds are often deterred from applying, not because they lack ability but because they fear accumulating debt. Abolishing fees would ensure that admission depends on merit rather than family wealth. Furthermore, society as a whole profits from a highly educated population. Doctors, engineers and teachers trained at public expense serve the community for decades, and the higher taxes they pay over their careers can more than offset the initial investment.

Admittedly, free tuition requires careful management of public funds, and governments may need to limit the number of places or prioritise subjects that address labour shortages. However, these challenges are practical rather than fundamental.

In conclusion, although charging fees may seem fair to some, I firmly believe that free university education is a worthwhile investment that creates a fairer and more prosperous society.""",

    ("A7", "low"): """Technology is now used in almost every classroom. Some people think it helps students learn more easily, but others believe it makes them lazy and they cannot concentrate. I will discuss both side in this essay.

On the one hand, technology has many advantages for learning. Students can search information on the internet very quickly instead of going to the library. There are also many useful apps, for example Duolingo or Quizlet, which help students practise vocabulary every day. In addition, during the Covid-19 pandemic, online learning allowed students to continue studying at home.

On the other hand, technology also has some disadvantages. Many students use their phone to play games or check social media during class, so they do not focus on the lesson. Moreover, some students copy answers from the internet or use AI to write their homework, so they do not think by themself. This makes them lazy.

In my opinion, technology is a useful tool, but students need to use it in the right way. Teachers and parents should control how students use smartphones and computers.

In conclusion, technology can make learning easier, but it also can make students lazy if they use it wrongly.""",
    ("A7", "mid"): """In recent years, technology has transformed the way students learn. While some people argue that digital devices make learning easier and more effective, others claim that they make students lazy and unable to concentrate. This essay will look at both perspectives before giving my own view.

Supporters of educational technology point out that it gives learners instant access to a huge amount of information. Instead of spending hours in a library, a student can now watch a lecture from a top university or read the latest research online. Furthermore, interactive applications make learning more engaging. For instance, language learners can practise pronunciation with speech-recognition apps and receive immediate feedback, which was impossible in the past.

However, critics are worried that constant exposure to screens has a negative effect on students' attention span. Notifications from social media and messaging apps interrupt study time, and many young people find it difficult to read a long text without checking their phones. Another concern is that tools such as online translators and AI chatbots allow students to complete assignments without real effort, so they fail to develop important skills like critical thinking.

In my opinion, technology itself is neither good nor bad; what matters is how it is used. Schools should teach students digital self-discipline, for example by setting phone-free study periods and explaining how to use AI responsibly.

In conclusion, technology has clearly made learning more accessible, but without proper guidance it can reduce concentration and effort. A balanced approach is therefore essential.""",
    ("A7", "high"): """The rapid spread of digital technology in education has divided opinion. Some argue that it has made learning more convenient and effective, whereas others contend that it has fostered laziness and eroded students' ability to concentrate. In my view, technology is a powerful aid to learning, provided that it is integrated thoughtfully.

Those who welcome technology in the classroom emphasise its capacity to personalise education. Adaptive learning platforms, for example, can identify a student's weaknesses and adjust the difficulty of exercises accordingly, something that a single teacher with forty students can rarely achieve. Online resources also democratise knowledge: a teenager in a rural province can now access the same high-quality lectures as students in major cities, which narrows the educational gap between regions.

On the other hand, the concerns raised by sceptics are far from groundless. Research suggests that the habit of multitasking between apps fragments attention, making sustained reading and deep reflection increasingly difficult. Moreover, the ready availability of answers online and the rise of generative AI may tempt students to outsource their thinking, producing work that looks polished but reflects little genuine understanding.

Nevertheless, I would argue that these problems stem from how technology is used rather than from technology itself. When teachers design tasks that require analysis and personal reflection, and when schools establish clear rules about device use, students can enjoy the benefits of digital tools without sacrificing concentration or intellectual effort.

In conclusion, while technology can encourage distraction and shortcuts, its potential to make learning more accessible and personalised is considerable. The key lies in guiding students to become active, disciplined users rather than passive consumers.""",

    ("A8", "low"): """The bar chart show how many hours people in four age groups spend on different leisure activities each week in 2025.

Overall, young people spend the most time on social media, while old people watch TV the most.

People aged 16-24 spend 18 hours on social media, which is the highest. They spend 7 hours watching TV, 6 hours for sport and only 2 hours reading. For the 25-44 group, social media is 11 hours and TV is 9 hours.

Older people is different. People from 45 to 64 watch TV 13 hours a week and the 65+ group watch TV 21 hours. They also read more, 5 and 8 hours. However, they spend very little time on social media and sport, only 2 hours for the oldest group.""",
    ("A8", "mid"): """The bar chart compares the average number of hours per week that people in four age groups spent on four leisure activities in 2025.

Overall, social media was the most popular activity among younger people, whereas watching TV dominated the free time of older age groups. Time spent on sport was relatively low for all ages.

The 16-24 age group spent 18 hours a week on social media, far more than on any other activity. They watched TV for 7 hours and did sport for 6 hours, while reading accounted for only 2 hours. A similar pattern can be seen in the 25-44 group, although the gap between social media (11 hours) and TV (9 hours) was much smaller.

In contrast, people aged 45-64 and over 65 spent most of their leisure time watching TV, at 13 and 21 hours respectively. These two groups also read more than younger people, with the figure reaching 8 hours for the oldest group. However, social media use fell sharply with age, to just 2 hours a week among those over 65.""",
    ("A8", "high"): """The bar chart illustrates how much time, on average, people of different ages devoted each week to four leisure pursuits in 2025: social media, sport and exercise, reading, and watching television.

The most striking feature is the inverse relationship between age and the use of social media and television. As age increases, time spent on social media declines steadily, while television viewing rises markedly. Physical exercise, meanwhile, remains the least popular activity across the board.

Social media is by far the dominant pastime for 16-24-year-olds, who spend 18 hours a week on it, more than double the time they allocate to television (7 hours). This figure drops to 11 hours for the 25-44 group and falls to a mere 2 hours among those aged 65 and above.

Television follows the opposite trajectory, climbing from 7 hours for the youngest group to 21 hours for the oldest, making it the single most time-consuming activity in the entire chart. Reading shows a similar, though less dramatic, upward trend, increasing from 2 to 8 hours, whereas time devoted to sport gradually decreases from 6 hours to just 2.""",

    ("A9", "high"): """Traffic congestion has become a daily nightmare for residents of many large cities, such as Ho Chi Minh City and Bangkok. This essay will examine the main causes of this problem and suggest some practical solutions.

The first and most obvious cause is the rapid increase in the number of private vehicles. As incomes rise, more families can afford cars and motorbikes, but road infrastructure has not developed at the same speed. Another cause is poor urban planning. In many cities, offices, schools and shopping centres are concentrated in the city centre, which means that millions of people travel to the same area at the same time every morning and evening. Finally, public transport in developing countries is often unreliable and uncomfortable, so people prefer to use their own vehicles.

Several measures could help to ease the situation. Governments should invest heavily in modern public transport systems, such as metro lines and bus rapid transit, and make them cheap and convenient enough to attract commuters. At the same time, policies like congestion charges or restrictions on vehicles entering the city centre during rush hour can discourage unnecessary journeys. In the long term, city planners should develop satellite towns with their own jobs and services, so that fewer people need to travel long distances.

In conclusion, traffic congestion is caused by the growing number of vehicles, poor planning and weak public transport. A combination of better public transport, smart traffic policies and balanced urban development is needed to solve this problem.""",
    ("A9", "mid"): """In many metropolitan areas, traffic jams have become part of everyday life, wasting time and polluting the air. In my view, the problem stems mainly from population growth and over-reliance on private vehicles, and it can be tackled through both infrastructure and behavioural changes.

One major cause is urban migration. Young people move from rural areas to big cities in search of jobs and education, and the population of these cities grows faster than their roads can expand. In addition, private vehicles remain the most convenient choice for most commuters because public transport networks are limited. Many people also make short trips by car or motorbike that could easily be done on foot or by bicycle.

To address these issues, governments should first improve public transport. A reliable metro system with frequent services and integrated bus routes can carry thousands of passengers who would otherwise drive. Secondly, companies could be encouraged to adopt flexible working hours or allow employees to work from home several days a week, which would reduce the number of vehicles on the road during peak times. Thirdly, cities should create safe walking paths and cycling lanes to promote green transport for short distances.

To conclude, traffic congestion results from rapid urbanisation and the dominance of private vehicles. Investing in public transport, changing working patterns and promoting walking and cycling are effective ways to make city streets less crowded.""",
}

# Lỗi được highlight (cụm phải có nguyên văn trong bài): (đề, mức) -> [(cụm, loại, gợi ý, nhận xét)]
ANNOTATIONS = {
    ("A1", "low"): [
        ("The line graph show", "Grammar", "The line graph shows", "Chủ ngữ số ít → động từ thêm -s."),
        ("three country", "Grammar", "three countries", "Danh từ đếm được số nhiều."),
        ("number of household", "Vocabulary", "proportion of households", "Đề cho phần trăm → dùng 'proportion/percentage'."),
        ("Japan increase quickly", "Grammar", "Japan's figure increased quickly", "Mô tả quá khứ → thì quá khứ đơn."),
        ("it rise from", "Grammar", "rising from", "Động từ bất quy tắc: rise - rose - risen; nên dùng mệnh đề rút gọn."),
    ],
    ("A2", "low"): [
        ("Nowaday", "Vocabulary", "Nowadays", "Chính tả."),
        ("both view", "Grammar", "both views", "'both' + danh từ số nhiều."),
        ("a lot of family", "Grammar", "a lot of families", None),
        ("the government do not", "Grammar", "the government does not", "Chủ ngữ số ít."),
        ("The money can use", "Grammar", "The money can be used", "Câu bị động."),
    ],
    ("A2", "mid2"): [
        ("Free education also reduce", "Grammar", "Free education also reduces", "Chủ ngữ số ít → reduces."),
        ("Both sides have their own reasons", "Coherence", None, "Câu mở bài nên nêu rõ quan điểm cá nhân ngay từ đầu."),
    ],
    ("A2", "mid"): [
        ("The most important one is", "Coherence", "The most compelling argument is", "Tránh 'one' mơ hồ trong văn học thuật."),
    ],
    ("A7", "low"): [
        ("discuss both side", "Grammar", "discuss both sides", None),
        ("search information", "Vocabulary", "search for information", "search for sth."),
        ("by themself", "Grammar", "for themselves", None),
        ("it also can make", "Grammar", "it can also make", "Trạng từ 'also' đứng sau động từ khuyết thiếu."),
    ],
    ("A8", "low"): [
        ("The bar chart show", "Grammar", "The bar chart shows", None),
        ("6 hours for sport", "Vocabulary", "6 hours on sport", "spend time ON sth."),
        ("Older people is", "Grammar", "Older people are", "'people' là danh từ số nhiều."),
    ],
}

SPEAKING_AUDIO = {"low": "/uploads/demo/speaking-03.mp3", "mid": "/uploads/demo/speaking-02.mp3",
                  "mid2": "/uploads/demo/speaking-01.mp3", "high": "/uploads/demo/speaking-04.mp3"}
